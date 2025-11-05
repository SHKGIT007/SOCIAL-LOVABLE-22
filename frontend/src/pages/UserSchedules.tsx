import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { apiService } from "@/services/api";
import Swal from 'sweetalert2';
import DashboardLayout from '../components/Layout/DashboardLayout';

import { Bell, BellOff, Edit2, Trash2 } from 'lucide-react';



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
  singleDate: '',
  platforms: [],
  days: [], // array of selected days
  times: {}, // { [day]: [time, ...] }
  recurrence: '',
  customDateFrom: '',
  customDateTo: '',
};
const emptyRow = () => ({ ...defaultSchedule });

export default function UserSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [rows, setRows] = useState([emptyRow()]);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    try {
      if (editingId !== null) {
        await apiService.put(`/schedules/${editingId}`, rows[0]);
        Swal.fire('Updated!', 'Schedule updated successfully', 'success');
      } else {
        for (const row of rows) {
          await apiService.post('/schedules', row);
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
    if (await Swal.fire({ title: 'Delete?', text: 'Are you sure?', icon: 'warning', showCancelButton: true })) {
      try {
        await apiService.delete(`/schedules/${id}`);
        Swal.fire('Deleted!', 'Schedule deleted', 'success');
        fetchSchedules();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete schedule', 'error');
      }
    }
  };

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
                const isActive = sch.status === 'pending';
                return (
                  <div key={sch.id} className={`flex items-center justify-between p-4 rounded-xl shadow border transition-all ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">
                        {isActive ? <Bell className="text-blue-500" /> : <BellOff className="text-gray-400" />}
                      </span>
                      <div>
                        <div className="text-base text-gray-700 font-semibold">Platforms: <span className="font-normal">{Array.isArray(sch.platforms) ? sch.platforms.join(', ') : sch.platforms}</span></div>
                        <div className="text-base text-gray-700">Time: <span className="font-normal">{sch.scheduled_at?.replace('T', ' ').slice(0, 16)}</span></div>
                        {sch.recurrence && <div className="text-xs text-indigo-500">Recurs: {sch.recurrence}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>{sch.status}</span>
                      <button title="Edit" className="p-2 hover:bg-blue-100 rounded" onClick={() => handleEdit(sch)}><Edit2 className="h-4 w-4 text-blue-600" /></button>
                      <button title="Delete" className="p-2 hover:bg-red-100 rounded" onClick={() => handleDelete(sch.id)}><Trash2 className="h-4 w-4 text-red-600" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal for Create/Edit Schedule */}
        
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
