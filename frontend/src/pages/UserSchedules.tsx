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

// Toggle
function ToggleSwitch({ checked, onChange }) {
  return (
    <label className="inline-flex items-center cursor-pointer select-none">
      <span className="relative">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <span className={`block w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-emerald-500/90' : 'bg-gray-300'}`} />
        <span className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
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
  days: [],
  times: {},
  recurrence: null,
  customDateFrom: null,
  customDateTo: null,
  singleDate: null,
  content_ai_prompt: '',
  image_prompt: '',
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

  useEffect(() => { fetchSchedules(); }, []);

  // Handle platform/day/recurrence
  const handleRowChange = (idx, e) => {
    const { name, value, type, checked } = e.target;
    setRows((prev) => {
      const updated = [...prev];
      if (name === 'platforms') {
        let platforms = [...updated[idx].platforms];
        if (checked) platforms.push(value); else platforms = platforms.filter((p) => p !== value);
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
          if (value === CUSTOM_DATE_KEY) { updated[idx].customDateFrom = ''; updated[idx].customDateTo = ''; }
          if (value === SINGLE_DATE_KEY) { updated[idx].singleDate = ''; }
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
      } else if (name === 'content_ai_prompt') {
        updated[idx].content_ai_prompt = value;
      } else if (name === 'image_prompt') {
        updated[idx].image_prompt = value;
      }
      return updated;
    });
  };

  const handleTimeChange = (rowIdx, day, timeIdx, value) => {
    setRows((prev) => {
      const updated = [...prev];
      const times = updated[rowIdx].times[day] ? [...updated[rowIdx].times[day]] : [''];
      times[timeIdx] = value;
      updated[rowIdx].times[day] = times;
      return updated;
    });
  };

  const handleAddTime = (rowIdx, day) => {
    setRows((prev) => {
      const updated = [...prev];
      if (!updated[rowIdx].times[day]) updated[rowIdx].times[day] = [''];
      updated[rowIdx].times[day].push('');
      return updated;
    });
  };

  const handleRemoveTime = (rowIdx, day, timeIdx) => {
    setRows((prev) => {
      const updated = [...prev];
      if (updated[rowIdx].times[day].length > 1) {
        updated[rowIdx].times[day] = updated[rowIdx].times[day].filter((_, i) => i !== timeIdx);
      }
      return updated;
    });
  };

  const handleAddRow = () => setRows((prev) => [...prev, emptyRow()]);
  const handleRemoveRow = (idx) => setRows((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        await apiService.updateSchedule(editingId, rows[0]);
        Swal.fire('Updated!', 'Schedule updated successfully', 'success');
      } else {
        for (let i = 0; i < rows.length; i++) {
          const row = JSON.parse(JSON.stringify(rows[i]));
          Object.keys(row.times).forEach(day => {
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

  const handleEdit = (schedule) => {
    setRows([{
      platforms: Array.isArray(schedule.platforms)
        ? schedule.platforms
        : (typeof schedule.platforms === 'string' ? schedule.platforms.split(',').map(p => p.trim()) : []),
      days: schedule.days || [],
      times: schedule.times || {},
      recurrence: schedule.recurrence || '',
      customDateFrom: schedule.customDateFrom || '',
      customDateTo: schedule.customDateTo || '',
      singleDate: schedule.singleDate || '',
      content_ai_prompt: schedule.content_ai_prompt || '',
      image_prompt: schedule.image_prompt || '',
    }]);
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
      } catch {
        Swal.fire('Error', 'Failed to delete schedule', 'error');
      }
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="min-h-[90vh] w-full flex flex-col items-center bg-gradient-to-br from-indigo-50 via-white to-purple-100 py-8 px-3">
        <div className="w-full max-w-6xl">
          <div className="flex items-center justify-between mb-8">
              <h2 className="flex items-baseline gap-2 text-3xl font-extrabold">
              <span className="flex bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">Your</span>
              Scheduled Posts
            </h2>
             <div>
          
           
          
          </div>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow font-semibold"
              onClick={() => { setRows([emptyRow()]); setEditingId(null); setModalOpen(true); }}
            >
              Create Schedule
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
            <div className="space-y-4">
              {schedules.length === 0 && (
                <div className="text-gray-400 text-center py-10">No schedules set.</div>
              )}

   {/* GRID WRAPPER */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
  {schedules.map((sch) => {
    const isActive = sch.status === '1' || sch.status === 1;
    return (
      <div key={sch.id} className="flex flex-col justify-between p-5 rounded-2xl border shadow-md">
       <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center h-10 w-10 rounded-full border bg-indigo-100">
              {isActive ? <Bell className="h-5 w-5 text-indigo-600" /> : <BellOff className="h-5 w-5 text-gray-400" />}
            </span>
            <div>
              <div className="text-sm text-gray-700 font-semibold">
                Platforms:{' '}
                <span className="font-normal">
                  {Array.isArray(sch.platforms) ? sch.platforms.join(', ') : sch.platforms}
                </span>
              </div>
              {sch.recurrence && (
                <div className="text-xs text-indigo-600 mt-0.5">Recurs: {sch.recurrence}</div>
              )}
            </div>
          </div>

          {/* Toggle Switch */}
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
        </div>


        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-200">
          <button
            type="button"
            title="View Details"
            className="p-2 rounded-lg hover:bg-indigo-100 transition"
            onClick={() => { setViewSchedule(sch); setViewModalOpen(true); }}
          >
            <Eye className="h-4 w-4 text-indigo-600" />
          </button>

          <button
            type="button"
            title="Edit"
            className="p-2 rounded-lg hover:bg-indigo-100 transition"
            onClick={() => handleEdit(sch)}
          >
            <Edit2 className="h-4 w-4 text-indigo-600" />
          </button>

          <button
            type="button"
            title="Delete"
            className="p-2 rounded-lg hover:bg-rose-100 transition"
            onClick={() => handleDelete(sch.id)}
          >
            <Trash2 className="h-4 w-4 text-rose-600" />
          </button>
        </div>
      </div>
    );
  })}
</div>

{/* SINGLE DIALOG (outside map) */}
<Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
  <div className="flex items-center justify-center min-h-screen px-4">
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
    <Dialog.Panel className="relative w-full max-w-lg mx-auto rounded-2xl shadow-2xl overflow-hidden z-10">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
        <Dialog.Title className="text-white text-xl font-bold flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-white/15 rounded-md p-1.5">
            <Eye className="h-5 w-5 text-white" />
          </span>
          Schedule Details
        </Dialog.Title>
      </div>

      <div className="bg-white px-6 py-5">
        {viewSchedule && (
          <div className="space-y-4">
            {/* platforms pills */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Platforms</div>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(viewSchedule.platforms)
                  ? viewSchedule.platforms
                  : String(viewSchedule.platforms || '').split(',').map(p => p.trim()))
                  .filter(Boolean)
                  .map((p, i) => (
                    <span key={`${p}-${i}`} className="px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {p}
                    </span>
                  ))}
              </div>
            </div>

            {/* days & times */}
            {viewSchedule.days?.length ? (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">Days & Times</div>
                <ul className="space-y-2">
                  {viewSchedule.days.map((day) => (
                    <li key={day} className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{getDayLabel(day)}:</span>
                        {day === 'custom_date' && (
                          <span className="text-xs text-slate-500">
                            {viewSchedule.customDateFrom} to {viewSchedule.customDateTo}
                          </span>
                        )}
                        {day === 'single_date' && (
                          <span className="text-xs text-slate-500">{viewSchedule.singleDate}</span>
                        )}
                        {viewSchedule.times?.[day]?.filter(Boolean).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 ml-auto">
                            {viewSchedule.times[day].filter(Boolean).map((t, idx) => (
                              <span key={`${day}-${t}-${idx}`} className="px-2 py-0.5 text-xs rounded-md bg-white border border-slate-200 text-slate-700">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {viewSchedule?.recurrence && (
              <div className="text-xs text-indigo-600">
                Recurs: <span className="font-medium">{viewSchedule.recurrence}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-50 px-6 py-3 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow"
          onClick={() => setViewModalOpen(false)}
        >
          Close
        </button>
      </div>
    </Dialog.Panel>
  </div>
</Dialog>


            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <Dialog.Panel className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] mx-auto p-8 z-10 flex flex-col overflow-y-auto">
              <Dialog.Title className="text-3xl font-extrabold mb-1 flex items-center gap-3 text-indigo-700">
                <Bell className="text-indigo-500" />  <span className="flex bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent">Auto</span> <span className="text-gray-900">Post Schedules</span>
              </Dialog.Title>
              <p className="text-sm text-gray-500 mb-6">Create Schedules</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {rows.map((row, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border ${idx > 0 ? 'border-indigo-200' : 'border-slate-200'} p-4 md:p-5 shadow-sm bg-white`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-800">Schedule Block {idx + 1}</h4>
                      <div className="flex gap-2">
                        {
                          editingId ? 
                          null
                          :
                          <button
                          type="button"
                          className="bg-emerald-500 text-white rounded-full h-9 w-9 flex items-center justify-center shadow hover:bg-emerald-600"
                          onClick={handleAddRow}
                          title="Add schedule row"
                        >
                          +
                        </button> 
                        }
                        
                        {rows.length > 1 && (
                          <button
                            type="button"
                            className="bg-rose-500 text-white rounded-full h-9 w-9 flex items-center justify-center shadow hover:bg-rose-600"
                            onClick={() => handleRemoveRow(idx)}
                            title="Remove this row"
                          >
                            –
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Platforms */}
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Select Target Platforms:</div>
                      <div className="flex gap-3 flex-wrap">
                        {['facebook', 'instagram'].map(p => (
                          <label key={p} className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="platforms"
                              value={p}
                              checked={row.platforms.includes(p)}
                              onChange={e => handleRowChange(idx, e)}
                              className="peer sr-only"
                            />
                            <span className="px-4 py-2 text-sm rounded-full border border-indigo-200 text-indigo-700 bg-indigo-50 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 transition">
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Content Prompt */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Content Prompt:</label>
                      <textarea
                        name="content_ai_prompt"
                        value={row.content_ai_prompt || ''}
                        onChange={e => handleRowChange(idx, e)}
                        className="w-full p-2 rounded border border-indigo-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100 text-sm"
                        rows={2}
                        placeholder="Enter content prompt for AI post generation..."
                      />
                    </div>

                    {/* Image Prompt */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Image Prompt:</label>
                      <textarea
                        name="image_prompt"
                        value={row.image_prompt || ''}
                        onChange={e => handleRowChange(idx, e)}
                        className="w-full p-2 rounded border border-indigo-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100 text-sm"
                        rows={2}
                        placeholder="Enter image prompt for AI image generation..."
                      />
                    </div>

                    {/* Frequency / Days */}
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Scheduling Frequency:</div>
                      <div className="flex flex-wrap gap-2">
                        {DAYS.map(day => (
                          <label key={day.value} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              name="days"
                              value={day.value}
                              checked={row.days.includes(day.value)}
                              onChange={e => handleRowChange(idx, e)}
                              disabled={day.value !== 'daily' && row.days.includes('daily')}
                              className="peer sr-only"
                            />
                            <span className="px-4 py-1.5 text-xs md:text-sm rounded-full border border-slate-200 text-slate-700 bg-slate-50 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 transition">
                              {day.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Custom date / Single date */}
                    <div className="mb-4">
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 rounded-xl bg-indigo-50/60 border border-indigo-100 p-3">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="days"
                            value={CUSTOM_DATE_KEY}
                            checked={row.days.includes(CUSTOM_DATE_KEY)}
                            onChange={e => handleRowChange(idx, e)}
                            disabled={row.days.includes('daily')}
                            className="peer sr-only"
                          />
                          <span className="px-3 py-1.5 text-xs md:text-sm rounded-full border border-indigo-200 text-indigo-700 bg-white peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 transition">
                            Custom Date Range
                          </span>
                        </label>

                        {row.days.includes(CUSTOM_DATE_KEY) && (
                          <>
                            <span className="text-xs text-slate-500">From</span>
                            <input
                              type="date"
                              name="customDateFrom"
                              value={row.customDateFrom || ''}
                              onChange={e => handleRowChange(idx, e)}
                              className="p-2 rounded border border-slate-200"
                              required
                            />
                            <span className="text-xs text-slate-500">To</span>
                            <input
                              type="date"
                              name="customDateTo"
                              value={row.customDateTo || ''}
                              onChange={e => handleRowChange(idx, e)}
                              className="p-2 rounded border border-slate-200"
                              required
                            />
                          </>
                        )}

                        <label className="inline-flex items-center ml-auto md:ml-6">
                          <input
                            type="checkbox"
                            name="days"
                            value={SINGLE_DATE_KEY}
                            checked={row.days.includes(SINGLE_DATE_KEY)}
                            onChange={e => handleRowChange(idx, e)}
                            disabled={row.days.includes('daily')}
                            className="peer sr-only"
                          />
                          <span className="px-3 py-1.5 text-xs md:text-sm rounded-full border border-indigo-200 text-indigo-700 bg-white peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 transition">
                            Single Date
                          </span>
                        </label>

                        {row.days.includes(SINGLE_DATE_KEY) && (
                          <input
                            type="date"
                            name="singleDate"
                            value={row.singleDate || ''}
                            onChange={e => handleRowChange(idx, e)}
                            className="p-2 rounded border border-slate-200"
                            required
                          />
                        )}
                      </div>
                    </div>

                    {/* Times */}
                    {row.days.map(day => (
                      <div key={day} className={`mb-3 ${day === CUSTOM_DATE_KEY ? 'bg-indigo-50/60 border border-indigo-100 rounded-xl p-3' : ''}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs md:text-sm font-semibold text-indigo-700">
                            {day === CUSTOM_DATE_KEY
                              ? `Custom Date${row.customDateFrom && row.customDateTo ? ` (${row.customDateFrom} to ${row.customDateTo})` : ''}`
                              : day === SINGLE_DATE_KEY
                                ? `Single Date${row.singleDate ? ` (${row.singleDate})` : ''}`
                                : DAYS.find(d => d.value === day)?.label} Times:
                          </span>
                          <button
                            type="button"
                            className="text-emerald-600 text-xs font-bold px-2 py-1 rounded hover:bg-emerald-50"
                            onClick={() => handleAddTime(idx, day)}
                          >
                            + Add Time
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {row.times[day]?.map((time, tIdx) => (
                            <div key={tIdx} className="flex items-center gap-1">
                              <input
                                type="time"
                                value={time}
                                onChange={e => handleTimeChange(idx, day, tIdx, e.target.value)}
                                className="p-2 rounded border border-slate-200"
                                required
                              />
                              {row.times[day].length > 1 && (
                                <button
                                  type="button"
                                  className="text-rose-500 text-xs px-2 py-1 rounded hover:bg-rose-50"
                                  onClick={() => handleRemoveTime(idx, day, tIdx)}
                                  title="Remove time"
                                >
                                  x
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700 font-semibold"
                  >
                    {editingId ? 'Update' : 'Create'} Schedule{rows.length > 1 && 's'}
                  </button>
                  <button
                    type="button"
                    className="px-5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
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
