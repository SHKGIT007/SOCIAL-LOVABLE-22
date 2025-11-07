import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { apiService } from "@/services/api";
import Swal from 'sweetalert2';
import DashboardLayout from '../components/Layout/DashboardLayout';

import { Bell, BellOff, Edit2, Trash2, Eye } from 'lucide-react';

// Helper to get day label
const getDayLabel = (day) => {
  if (day === 'custom_date') return 'Custom Date Range';
  if (day === 'single_date') return 'Single Date';
  const found = DAYS.find(d => d.value === day);
  return found ? found.label : day;
};

// Simple Toggle Switch component
function ToggleSwitch({ checked, onChange }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <span className="relative">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-green-400' : 'bg-gray-300'}`}></div>
        <div className={`absolute left-0 top-0 w-6 h-6 bg-white border rounded-full shadow transform transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`}></div>
      </span>
    </label>
  );
}



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

const defaultSchedule = {
  platforms: [],
  days: [], // array of selected days
  times: {}, // { [day]: [time, ...] }
  recurrence: null,
  customDateFrom: null,
  customDateTo: null,
  singleDate: null,
};
const emptyRow = () => ({ ...defaultSchedule });

export default function UserSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [rows, setRows] = useState([emptyRow()]);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewSchedule, setViewSchedule] = useState(null);

  const fetchSchedules = async () => {
    try {
      const res = await apiService.getSchedules();
      setSchedules(res.schedules || res.data?.schedules || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch schedules', 'error');
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);


  // Handle platform, day, and recurrence changes
  const handleRowChange = (idx, e) => {
    const { name, value, type, checked } = e.target;
    setRows((prev) => {
      const updated = [...prev];
      if (name === 'platforms') {
        let platforms = [...updated[idx].platforms];
        if (checked) {
          platforms.push(value);
        } else {
          platforms = platforms.filter((p) => p !== value);
        }
        updated[idx] = { ...updated[idx], platforms };
      } else if (name === 'days') {
        let days = [...updated[idx].days];
        if (checked) {
          if (value === 'daily') {
            days = ['daily'];
            updated[idx].times = { daily: [''] };
          } else if (value === CUSTOM_DATE_KEY) {
            days.push(CUSTOM_DATE_KEY);
            if (!updated[idx].times[CUSTOM_DATE_KEY]) updated[idx].times[CUSTOM_DATE_KEY] = [''];
            // Also add default customDateFrom and customDateTo if not present
            if (typeof updated[idx].customDateFrom === 'undefined') updated[idx].customDateFrom = '';
            if (typeof updated[idx].customDateTo === 'undefined') updated[idx].customDateTo = '';
          } else if (value === SINGLE_DATE_KEY) {
            days.push(SINGLE_DATE_KEY);
            if (!updated[idx].times[SINGLE_DATE_KEY]) updated[idx].times[SINGLE_DATE_KEY] = [''];
            if (typeof updated[idx].singleDate === 'undefined') updated[idx].singleDate = '';
          } else {
            days = days.filter((d) => d !== 'daily');
            days.push(value);
            if (!updated[idx].times[value]) updated[idx].times[value] = [''];
          }
        } else {
          days = days.filter((d) => d !== value);
          if (updated[idx].times[value]) delete updated[idx].times[value];
          if (value === CUSTOM_DATE_KEY) {
            updated[idx].customDateFrom = '';
            updated[idx].customDateTo = '';
          }
          if (value === SINGLE_DATE_KEY) {
            updated[idx].singleDate = '';
          }
        }
        updated[idx] = { ...updated[idx], days };
      } else if (name === 'customDateFrom') {
        updated[idx].customDateFrom = value;
      } else if (name === 'customDateTo') {
        updated[idx].customDateTo = value;
      } else if (name === 'singleDate') {
        updated[idx].singleDate = value;
      } else if (name === 'recurrence') {
        updated[idx] = { ...updated[idx], recurrence: value };
      }
      return updated;
    });
  };

  // Handle time changes for a specific day and time index
  const handleTimeChange = (rowIdx, day, timeIdx, value) => {
    setRows((prev) => {
      const updated = [...prev];
      const times = updated[rowIdx].times[day] ? [...updated[rowIdx].times[day]] : [''];
      times[timeIdx] = value;
      updated[rowIdx].times[day] = times;
      return updated;
    });
  };

  // Add a new time input for a specific day
  const handleAddTime = (rowIdx, day) => {
    setRows((prev) => {
      const updated = [...prev];
      if (!updated[rowIdx].times[day]) updated[rowIdx].times[day] = [''];
      updated[rowIdx].times[day].push('');
      return updated;
    });
  };

  // Remove a time input for a specific day
  const handleRemoveTime = (rowIdx, day, timeIdx) => {
    setRows((prev) => {
      const updated = [...prev];
      if (updated[rowIdx].times[day].length > 1) {
        updated[rowIdx].times[day] = updated[rowIdx].times[day].filter((_, i) => i !== timeIdx);
      }
      return updated;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
  };

  const handleRemoveRow = (idx) => {
    setRows((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    // Validation: at least one platform AND at least one day/custom date/single date must be selected in every row
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].platforms || rows[i].platforms.length === 0) {
        Swal.fire('Validation Error', 'Please select at least one platform for every schedule.', 'warning');
        return;
      }
      if (!rows[i].days || rows[i].days.length === 0) {
        Swal.fire('Validation Error', 'Please select at least one day, custom date, or single date for every schedule.', 'warning');
        return;
      }
    }
    try {
      if (editingId !== null) {
        // Only update the selected row
        await apiService.updateSchedule(editingId, rows[0]);
        Swal.fire('Updated!', 'Schedule updated successfully', 'success');
      } else {
        // Store all rows as separate schedules, each with only its own times
        for (let i = 0; i < rows.length; i++) {
          // Deep clone the row to avoid mutation
          const row = JSON.parse(JSON.stringify(rows[i]));
          // Remove times for days not selected in this row
          Object.keys(row.times).forEach(day => {
            if (!row.days.includes(day)) {
              delete row.times[day];
            }
          });
          await apiService.postSchedule(row);
        }
        Swal.fire('Created!', 'Schedules created successfully', 'success');
      }
      setRows([emptyRow()]);
      setEditingId(null);
      setModalOpen(false);
      fetchSchedules();
    } catch (err) {
      Swal.fire('Error', 'Failed to save schedule(s)', 'error');
    }
  };

  const handleEdit = (schedule) => {
    setRows([
      {
        platforms: Array.isArray(schedule.platforms)
          ? schedule.platforms
          : (typeof schedule.platforms === 'string' ? schedule.platforms.split(',').map(p => p.trim()) : []),
        days: schedule.days || [],
        times: schedule.times || {},
        recurrence: schedule.recurrence || '',
        customDateFrom: schedule.customDateFrom || '',
        customDateTo: schedule.customDateTo || '',
        singleDate: schedule.singleDate || '',
      },
    ]);
    setEditingId(schedule.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Delete?', text: 'Are you sure?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        await apiService.deleteSchedule(id);
        Swal.fire('Deleted!', 'Schedule deleted', 'success');
        fetchSchedules();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete schedule', 'error');
      }
    }
  };

  console.log("viewSchedule: ", viewSchedule);

  return (
    <DashboardLayout userRole="client">
      <div className="min-h-[90vh] w-full flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-8 px-2">
        <div className="w-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold flex items-center gap-3 text-indigo-700 drop-shadow">
              <Bell className="text-blue-500 h-8 w-8" /> Your Scheduled Posts
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
              {schedules.length === 0 && <div className="text-gray-400 text-center py-8">No schedules set.</div>}
              {schedules.map(sch => {
                const isActive = sch.status === '1' || sch.status === 1;
                return (
                  <div key={sch.id} className={`flex items-center justify-between p-4 rounded-xl shadow border transition-all ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">
                        {isActive ? <Bell className="text-blue-500" /> : <BellOff className="text-gray-400" />}
                      </span>
                      <div>
                        <div className="text-base text-gray-700 font-semibold">Platforms: <span className="font-normal">{Array.isArray(sch.platforms) ? sch.platforms.join(', ') : sch.platforms}</span></div>

                        {sch.recurrence && <div className="text-xs text-indigo-500">Recurs: {sch.recurrence}</div>}
                      </div>
                    </div>


                    <div className="flex items-center gap-2">

                      <ToggleSwitch checked={isActive} onChange={async () => {
                        try {
                          await apiService.toggleScheduleStatus(sch.id, isActive ? '0' : '1');
                          fetchSchedules();
                        } catch (err) {
                          Swal.fire('Error', 'Failed to update status', 'error');
                        }
                      }} />

                      {/* Eye icon button to view schedule details */}
                      <button title="View Details" className="p-2 hover:bg-indigo-100 rounded" onClick={() => { setViewSchedule(sch); setViewModalOpen(true); }}>
                        <Eye className="h-4 w-4 text-indigo-600" />
                      </button>
                      {/* Modal to show schedule details */}
                      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4">
                          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
                          <Dialog.Panel className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto p-6 z-10 flex flex-col">
                            <Dialog.Title className="text-xl font-bold mb-2 flex items-center gap-2 text-indigo-700">
                              <Eye className="text-indigo-500" /> Schedule Details
                            </Dialog.Title>
                            {viewSchedule && (
                              <div className="space-y-2">
                                <div className="text-base font-semibold text-gray-700">Platforms: <span className="font-normal">{Array.isArray(viewSchedule.platforms) ? viewSchedule.platforms.join(', ') : viewSchedule.platforms}</span></div>
                                {viewSchedule.days && viewSchedule.days.length > 0 && (
                                  <div>
                                    <div className="font-semibold text-indigo-600 mb-1">Days & Times:</div>
                                    <ul className="list-disc pl-5 space-y-1">
                                      {viewSchedule.days.map(day => (
                                        <li key={day}>
                                          <span className="font-medium">{getDayLabel(day)}:</span>
                                          {day === 'custom_date' && (
                                            <span className="ml-2 text-xs text-gray-500">{viewSchedule.customDateFrom} to {viewSchedule.customDateTo}</span>
                                          )}
                                          {day === 'single_date' && (
                                            <span className="ml-2 text-xs text-gray-500">{viewSchedule.singleDate}</span>
                                          )}
                                          {viewSchedule.times && viewSchedule.times[day] && viewSchedule.times[day].length > 0 && (
                                            <span className="ml-2">[
                                              {viewSchedule.times[day].filter(Boolean).join(', ')}
                                              ]</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {viewSchedule.recurrence && <div className="text-xs text-indigo-500">Recurs: {viewSchedule.recurrence}</div>}
                                <div className="flex justify-end mt-4">
                                  <button className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => setViewModalOpen(false)}>Close</button>
                                </div>
                              </div>
                            )}
                          </Dialog.Panel>
                        </div>
                      </Dialog>

                      <button title="Edit" className="p-2 hover:bg-blue-100 rounded" onClick={() => handleEdit(sch)}><Edit2 className="h-4 w-4 text-blue-600" /></button>
                      <button title="Delete" className="p-2 hover:bg-red-100 rounded" onClick={() => handleDelete(sch.id)}><Trash2 className="h-4 w-4 text-red-600" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>





        {/* Modal for Create/Edit Schedule  */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
            <Dialog.Panel className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full h-[90vh] mx-auto p-8 z-10 flex flex-col overflow-y-auto">
              <Dialog.Title className="text-2xl font-bold mb-4 flex items-center gap-2 text-indigo-700">
                <Bell className="text-blue-500" /> Auto Post Schedules
              </Dialog.Title>
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">Create Schedules</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {rows.map((row, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 items-end mb-2${idx > 0 ? ' border-t border-indigo-200 pt-4 mt-4' : ''}`}
                  >
                    <div className="flex flex-col gap-2 flex-1">
                      {/* Platforms */}
                      <div className="flex gap-4 items-center mb-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="platforms"
                            value="facebook"
                            checked={row.platforms.includes('facebook')}
                            onChange={e => handleRowChange(idx, e)}
                          />
                          <span className="font-medium">Facebook</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="platforms"
                            value="instagram"
                            checked={row.platforms.includes('instagram')}
                            onChange={e => handleRowChange(idx, e)}
                          />
                          <span className="font-medium">Instagram</span>
                        </label>
                      </div>
                      {/* Days of week */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <div className="flex flex-wrap gap-2">
                          {DAYS.map(day => (
                            <label key={day.value} className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                name="days"
                                value={day.value}
                                checked={row.days.includes(day.value)}
                                onChange={e => handleRowChange(idx, e)}
                                disabled={day.value !== 'daily' && row.days.includes('daily')}
                              />
                              <span className="text-xs font-medium">{day.label}</span>
                            </label>
                          ))}
                        </div>
                        {/* Custom Date & Single Date Option - visually separated */}
                        <div className="flex items-center gap-2 mt-2 pt-2 border-indigo-100 w-full">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              name="days"
                              value={CUSTOM_DATE_KEY}
                              checked={row.days.includes(CUSTOM_DATE_KEY)}
                              onChange={e => handleRowChange(idx, e)}
                              disabled={row.days.includes('daily')}
                            />
                            <span className="text-xs font-medium">Custom Date Range</span>
                          </label>
                          {row.days.includes(CUSTOM_DATE_KEY) && (
                            <>
                              <span className="ml-2 text-xs">From</span>
                              <input
                                type="date"
                                name="customDateFrom"
                                value={row.customDateFrom || ''}
                                onChange={e => handleRowChange(idx, e)}
                                className="ml-1 p-1 border rounded"
                                required
                              />
                              <span className="ml-2 text-xs">To</span>
                              <input
                                type="date"
                                name="customDateTo"
                                value={row.customDateTo || ''}
                                onChange={e => handleRowChange(idx, e)}
                                className="ml-1 p-1 border rounded"
                                required
                              />
                            </>
                          )}
                          <label className="flex items-center gap-1 ml-6">
                            <input
                              type="checkbox"
                              name="days"
                              value={SINGLE_DATE_KEY}
                              checked={row.days.includes(SINGLE_DATE_KEY)}
                              onChange={e => handleRowChange(idx, e)}
                              disabled={row.days.includes('daily')}
                            />
                            <span className="text-xs font-medium">Single Date</span>
                          </label>
                          {row.days.includes(SINGLE_DATE_KEY) && (
                            <input
                              type="date"
                              name="singleDate"
                              value={row.singleDate || ''}
                              onChange={e => handleRowChange(idx, e)}
                              className="ml-2 p-1 border rounded"
                              required
                            />
                          )}
                        </div>
                      </div>
                      {/* Times for each selected day */}
                      {row.days.map(day => (
                        <div key={day} className={`mb-2 ${day === CUSTOM_DATE_KEY ? 'bg-indigo-50 border border-indigo-100 rounded p-2' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-indigo-600">
                              {day === CUSTOM_DATE_KEY
                                ? `Custom Date${row.customDateFrom && row.customDateTo ? ` (${row.customDateFrom} to ${row.customDateTo})` : ''}`
                                : day === SINGLE_DATE_KEY
                                  ? `Single Date${row.singleDate ? ` (${row.singleDate})` : ''}`
                                  : DAYS.find(d => d.value === day)?.label} Times:
                            </span>
                            <button type="button" className="text-green-600 text-xs font-bold px-2 py-1 rounded hover:bg-green-100" onClick={() => handleAddTime(idx, day)}>+ Add Time</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {row.times[day]?.map((time, tIdx) => (
                              <div key={tIdx} className="flex items-center gap-1">
                                <input
                                  type="time"
                                  value={time}
                                  onChange={e => handleTimeChange(idx, day, tIdx, e.target.value)}
                                  className="p-1 border rounded"
                                  required
                                />
                                {row.times[day].length > 1 && (
                                  <button type="button" className="text-red-500 text-xs px-1" onClick={() => handleRemoveTime(idx, day, tIdx)} title="Remove time">x</button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                    </div>
                    <button
                      type="button"
                      className="bg-green-500 text-white rounded-full p-2 h-9 w-9 flex items-center justify-center shadow hover:bg-green-600"
                      onClick={handleAddRow}
                      title="Add schedule row"
                    >
                      <span className="text-xl font-bold">+</span>
                    </button>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        className="bg-red-500 text-white rounded-full p-2 h-9 w-9 flex items-center justify-center shadow hover:bg-red-600"
                        onClick={() => handleRemoveRow(idx)}
                        title="Remove this row"
                      >
                        <span className="text-xl font-bold">-</span>
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 font-semibold">
                    {editingId ? 'Update' : 'Create'} Schedule{rows.length > 1 && 's'}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded border"
                    onClick={() => { setRows([emptyRow()]); setEditingId(null); setModalOpen(false); }}
                  >
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