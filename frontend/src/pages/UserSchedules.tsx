import React, { useEffect, useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { apiService } from '@/services/api';
import Swal from 'sweetalert2';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Bell, BellOff, Edit2, Trash2, Eye, Plus, Minus, Clock } from 'lucide-react';

// --- Helpers & UI ---
const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <label className="inline-flex items-center cursor-pointer">
    <span className="relative">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-green-400' : 'bg-gray-300'}`} />
      <div className={`absolute left-0 top-0 w-6 h-6 bg-white border rounded-full shadow transform transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`} />
    </span>
  </label>
);

const DAYS = [
  { value: 'daily', label: 'Daily' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const CUSTOM_DATE_KEY = 'custom_date';
const SINGLE_DATE_KEY = 'single_date';

type Row = {
  platforms: string[];
  days: string[];
  times: Record<string, string[]>;
  recurrence?: string | null;
  customDateFrom?: string | null;
  customDateTo?: string | null;
  singleDate?: string | null;
};

const emptyRow = (): Row => ({
  platforms: [],
  days: [],
  times: {},
  recurrence: null,
  customDateFrom: null,
  customDateTo: null,
  singleDate: null,
});

export default function UserSchedules() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSchedules = async () => {
    try {
      const res = await apiService.getSchedules();
      setSchedules(res.schedules || res.data?.schedules || []);
    } catch {
      Swal.fire('Error', 'Failed to fetch schedules', 'error');
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // ---- Handlers for the dialog form ----
  const handleRowChange = useCallback((idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setRows(prev => {
      const updated = [...prev];
      const row = { ...updated[idx] };

      if (name === 'platforms' && type === 'checkbox') {
        const next = new Set(row.platforms);
        checked ? next.add(value) : next.delete(value);
        row.platforms = Array.from(next);
      } else if (name === 'days' && type === 'checkbox') {
        let days = new Set(row.days);

        if (checked) {
          if (value === 'daily') {
            days = new Set(['daily']);
            row.times = { daily: row.times.daily ?? [''] };
          } else if (value === CUSTOM_DATE_KEY) {
            days.add(CUSTOM_DATE_KEY);
            row.times[CUSTOM_DATE_KEY] = row.times[CUSTOM_DATE_KEY] ?? [''];
            if (!row.customDateFrom) row.customDateFrom = '';
            if (!row.customDateTo) row.customDateTo = '';
          } else if (value === SINGLE_DATE_KEY) {
            days.add(SINGLE_DATE_KEY);
            row.times[SINGLE_DATE_KEY] = row.times[SINGLE_DATE_KEY] ?? [''];
            if (!row.singleDate) row.singleDate = '';
          } else {
            days.delete('daily');
            days.add(value);
            row.times[value] = row.times[value] ?? [''];
          }
        } else {
          days.delete(value);
          if (row.times[value]) delete row.times[value];
          if (value === CUSTOM_DATE_KEY) {
            row.customDateFrom = '';
            row.customDateTo = '';
          }
          if (value === SINGLE_DATE_KEY) {
            row.singleDate = '';
          }
        }

        row.days = Array.from(days);
      } else if (name === 'customDateFrom') {
        row.customDateFrom = value;
      } else if (name === 'customDateTo') {
        row.customDateTo = value;
      } else if (name === 'singleDate') {
        row.singleDate = value;
      } else if (name === 'recurrence') {
        row.recurrence = value;
      }

      updated[idx] = row;
      return updated;
    });
  }, []);

  const handleTimeChange = (rowIdx: number, day: string, timeIdx: number, value: string) => {
    setRows(prev => {
      const updated = [...prev];
      const row = { ...updated[rowIdx] };
      const times = row.times[day] ? [...row.times[day]] : [''];
      times[timeIdx] = value;
      row.times[day] = times;
      updated[rowIdx] = row;
      return updated;
    });
  };

  const handleAddTime = (rowIdx: number, day: string) => {
    setRows(prev => {
      const updated = [...prev];
      const row = { ...updated[rowIdx] };
      row.times[day] = [...(row.times[day] || []), ''];
      updated[rowIdx] = row;
      return updated;
    });
  };

  const handleRemoveTime = (rowIdx: number, day: string, timeIdx: number) => {
    setRows(prev => {
      const updated = [...prev];
      const row = { ...updated[rowIdx] };
      if ((row.times[day] || []).length > 1) {
        row.times[day] = row.times[day].filter((_, i) => i !== timeIdx);
      }
      updated[rowIdx] = row;
      return updated;
    });
  };

  const handleAddRow = () => setRows(prev => [...prev, emptyRow()]);
  const handleRemoveRow = (idx: number) => setRows(prev => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    for (const r of rows) {
      if (!r.platforms.length) {
        Swal.fire('Validation Error', 'Please select at least one platform for every schedule.', 'warning');
        return;
      }
      if (!r.days.length) {
        Swal.fire('Validation Error', 'Please select at least one day, custom date, or single date for every schedule.', 'warning');
        return;
      }
    }

    try {
      if (editingId !== null) {
        await apiService.updateSchedule(editingId, rows[0]);
        Swal.fire('Updated!', 'Schedule updated successfully', 'success');
      } else {
        for (const r0 of rows) {
          const row = JSON.parse(JSON.stringify(r0));
          Object.keys(row.times).forEach((day: string) => {
            if (!row.days.includes(day)) delete row.times[day];
          });
          await apiService.postSchedule(row);
        }
        Swal.fire('Created!', 'Schedules created successfully', 'success');
      }
      setRows([emptyRow()]);
      setEditingId(null);
      setModalOpen(false);
      fetchSchedules();
    } catch {
      Swal.fire('Error', 'Failed to save schedule(s)', 'error');
    }
  };

  const handleEdit = (sch: any) => {
    setRows([{
      platforms: Array.isArray(sch.platforms)
        ? sch.platforms
        : (typeof sch.platforms === 'string' ? sch.platforms.split(',').map((p: string) => p.trim()) : []),
      days: sch.days || [],
      times: sch.times || {},
      recurrence: sch.recurrence || '',
      customDateFrom: sch.customDateFrom || '',
      customDateTo: sch.customDateTo || '',
      singleDate: sch.singleDate || '',
    }]);
    setEditingId(sch.id);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: 'Delete?', text: 'Are you sure?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        await apiService.deleteSchedule(id);
        Swal.fire('Deleted!', 'Schedule deleted', 'success');
        fetchSchedules();
      } catch {
        Swal.fire('Error', 'Failed to delete schedule', 'error');
      }
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="min-h-[90vh] w-full flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-8 px-2">
        <div className="w-full">
          <div className="flex items-center justify-between mb-8">
          <h2 className="flex items-baseline gap-2">
  <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent leading-none">
    AI
  </span>
  <span className="text-3xl font-extrabold text-gray-800 leading-none">
    Auto Post Schedules
  </span>
</h2>

            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow font-semibold"
              onClick={() => { setRows([emptyRow()]); setEditingId(null); setModalOpen(true); }}
            >
              Create Schedule
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 min-h-[350px]">
            <div className="space-y-4">
              {!schedules.length && <div className="text-gray-400 text-center py-8">No schedules set.</div>}
              {schedules.map((sch) => {
                const isActive = sch.status === '1' || sch.status === 1;
                return (
                  <div key={sch.id} className={`flex items-center justify-between p-4 rounded-xl shadow border transition-all ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">
                        {isActive ? <Bell className="text-blue-500" /> : <BellOff className="text-gray-400" />}
                      </span>
                      <div>
                        <div className="text-base text-gray-700 font-semibold">
                          Platforms: <span className="font-normal">{Array.isArray(sch.platforms) ? sch.platforms.join(', ') : sch.platforms}</span>
                        </div>
                        {sch.recurrence && <div className="text-xs text-indigo-500">Recurs: {sch.recurrence}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        checked={isActive}
                        onChange={async () => {
                          try {
                            await apiService.toggleScheduleStatus(sch.id, isActive ? '0' : '1');
                            fetchSchedules();
                          } catch {
                            Swal.fire('Error', 'Failed to update status', 'error');
                          }
                        }}
                      />
                      <button title="View Details" className="p-2 hover:bg-indigo-100 rounded"
                        onClick={() => Swal.fire('Details', JSON.stringify(sch, null, 2), 'info')}>
                        <Eye className="h-4 w-4 text-indigo-600" />
                      </button>
                      <button title="Edit" className="p-2 hover:bg-blue-100 rounded" onClick={() => handleEdit(sch)}>
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </button>
                      <button title="Delete" className="p-2 hover:bg-red-100 rounded" onClick={() => handleDelete(sch.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-40" aria-hidden="true" />
            <Dialog.Panel className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[95vh] mx-auto p-8 z-10 flex flex-col overflow-y-auto transform transition-all">
              <Dialog.Title className="text-3xl font-extrabold mb-6 flex items-center gap-3 text-indigo-800 border-b pb-3">
             <h2 className="flex items-center gap-3 text-3xl font-extrabold">
  <Bell className="text-blue-500 w-8 h-8" />
  <span className="bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">
    Auto
  </span>
  <span className="text-gray-800"> Post Schedules</span>
</h2>

              </Dialog.Title>

              <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-2">
                {rows.map((row, idx) => (
                  <div key={idx} className={`p-6 rounded-xl border border-indigo-200 bg-white shadow-lg transition-all duration-300 ${idx > 0 ? 'mt-6' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-semibold text-gray-700">Schedule Block {idx + 1}</h4>
                      <div className="flex gap-2">
                        {rows.length > 1 && (
                          <button type="button" className="bg-red-500 text-white rounded-full p-2 h-9 w-9 flex items-center justify-center shadow hover:bg-red-600 transition" onClick={() => handleRemoveRow(idx)} title="Remove this schedule block">
                            <Minus className="w-5 h-5" />
                          </button>
                        )}
                        <button type="button" className="bg-green-500 text-white rounded-full p-2 h-9 w-9 flex items-center justify-center shadow hover:bg-green-600 transition" onClick={handleAddRow} title="Add a new schedule block">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Platforms */}
                      <div>
                        <p className="font-medium text-sm text-gray-600 mb-2">Select Target Platforms:</p>
                        <div className="flex gap-4">
                          {['facebook', 'instagram'].map((platform) => (
                            <label key={platform} className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${row.platforms.includes(platform) ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md' : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                              <input type="checkbox" name="platforms" value={platform} checked={row.platforms.includes(platform)} onChange={(e) => handleRowChange(idx, e)} className="hidden" />
                              <span className="font-semibold capitalize">{platform}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Days / Dates */}
                      <div>
                        <p className="font-medium text-sm text-gray-600 mb-2">Scheduling Frequency:</p>

                        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          {DAYS.map((day) => (
                            <label key={day.value} className={`px-4 py-2 text-xs font-bold rounded-full cursor-pointer transition-all duration-200 ${row.days.includes(day.value) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-100'} ${day.value !== 'daily' && row.days.includes('daily') ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <input type="checkbox" name="days" value={day.value} checked={row.days.includes(day.value)} onChange={(e) => handleRowChange(idx, e)} disabled={day.value !== 'daily' && row.days.includes('daily')} className="hidden" />
                              {day.label}
                            </label>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-4 items-center p-3 border-t border-gray-200 pt-4">
                          {/* Custom Range */}
                          <label className={`flex items-center gap-2 transition p-2 rounded ${row.days.includes(CUSTOM_DATE_KEY) ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                            <input type="checkbox" name="days" value={CUSTOM_DATE_KEY} checked={row.days.includes(CUSTOM_DATE_KEY)} onChange={(e) => handleRowChange(idx, e)} disabled={row.days.includes('daily') || row.days.includes(SINGLE_DATE_KEY)} className="form-checkbox text-indigo-600 rounded" />
                            <span className="text-sm font-medium">Custom Date Range</span>
                          </label>

                          {row.days.includes(CUSTOM_DATE_KEY) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>From</span>
                              <input type="date" name="customDateFrom" value={row.customDateFrom || ''} onChange={(e) => handleRowChange(idx, e)} className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                              <span>To</span>
                              <input type="date" name="customDateTo" value={row.customDateTo || ''} onChange={(e) => handleRowChange(idx, e)} className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                            </div>
                          )}

                          {/* Single Date */}
                          <label className={`flex items-center gap-2 transition ml-6 p-2 rounded ${row.days.includes(SINGLE_DATE_KEY) ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                            <input type="checkbox" name="days" value={SINGLE_DATE_KEY} checked={row.days.includes(SINGLE_DATE_KEY)} onChange={(e) => handleRowChange(idx, e)} disabled={row.days.includes('daily') || row.days.includes(CUSTOM_DATE_KEY)} className="form-checkbox text-indigo-600 rounded" />
                            <span className="text-sm font-medium">Single Date</span>
                          </label>

                          {row.days.includes(SINGLE_DATE_KEY) && (
                            <input type="date" name="singleDate" value={row.singleDate || ''} onChange={(e) => handleRowChange(idx, e)} className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                          )}
                        </div>
                      </div>

                      {/* Times */}
                      <div className="space-y-4">
                        <p className="font-medium text-sm text-gray-600 pt-2 border-t border-gray-100">Scheduled Times:</p>
                        {row.days.map((day) => (
                          <div key={day} className="bg-gray-50 border border-gray-200 rounded-xl p-4 transition-all duration-300">
                            <div className="flex justify-between items-center gap-2 mb-3">
                              <span className={`text-sm font-bold flex items-center gap-2 ${day === CUSTOM_DATE_KEY || day === SINGLE_DATE_KEY ? 'text-orange-700' : 'text-indigo-700'}`}>
                                <Clock className="w-4 h-4" />
                                {day === CUSTOM_DATE_KEY
                                  ? `Custom Date${row.customDateFrom && row.customDateTo ? ` (${row.customDateFrom} to ${row.customDateTo})` : ''}`
                                  : day === SINGLE_DATE_KEY
                                  ? `Single Date${row.singleDate ? ` (${row.singleDate})` : ''}`
                                  : DAYS.find(d => d.value === day)?.label}{' '}
                                Times:
                              </span>
                              <button type="button" className="bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full hover:bg-indigo-200 transition" onClick={() => handleAddTime(idx, day)}>
                                + Add Time Slot
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {(row.times[day] || []).map((time, tIdx) => (
                                <div key={tIdx} className="flex items-center p-1 bg-white border border-indigo-300 rounded-lg shadow-sm">
                                  <input type="time" value={time} onChange={(e) => handleTimeChange(idx, day, tIdx, e.target.value)} className="p-1 text-sm border-none focus:ring-0 rounded" required />
                                  {(row.times[day] || []).length > 1 && (
                                    <button type="button" className="text-red-500 hover:text-red-700 p-1 transition" onClick={() => handleRemoveTime(idx, day, tIdx)} title="Remove time">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4 mt-8 pt-4 border-t border-gray-200">
                  <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-indigo-700 font-bold transition transform hover:scale-[1.01]">
                    {editingId ? 'Update' : 'Create'} Schedule{rows.length > 1 ? 's' : ''}
                  </button>
                  <button type="button" className="px-6 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition font-semibold" onClick={() => { setRows([emptyRow()]); setEditingId(null); setModalOpen(false); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
