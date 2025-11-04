import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import Swal from 'sweetalert2';

const defaultSchedule = {
  content: '',
  platforms: '',
  scheduled_at: '',
  recurrence: '',
};

export default function UserSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState(defaultSchedule);
  const [editingId, setEditingId] = useState(null);

  const fetchSchedules = async () => {
    try {
      const res = await apiService.get('/schedules');
      setSchedules(res.data.schedules || res.data.data?.schedules || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch schedules', 'error');
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiService.put(`/schedules/${editingId}`, form);
        Swal.fire('Updated!', 'Schedule updated successfully', 'success');
      } else {
        await apiService.post('/schedules', form);
        Swal.fire('Created!', 'Schedule created successfully', 'success');
      }
      setForm(defaultSchedule);
      setEditingId(null);
      fetchSchedules();
    } catch (err) {
      Swal.fire('Error', 'Failed to save schedule', 'error');
    }
  };

  const handleEdit = (schedule) => {
    setForm({
      content: schedule.content,
      platforms: schedule.platforms,
      scheduled_at: schedule.scheduled_at?.slice(0, 16),
      recurrence: schedule.recurrence || '',
    });
    setEditingId(schedule.id);
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
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Post Schedules</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input name="content" value={form.content} onChange={handleChange} placeholder="Post content" className="w-full p-2 border rounded" required />
        <input name="platforms" value={form.platforms} onChange={handleChange} placeholder="Platforms (comma separated)" className="w-full p-2 border rounded" required />
        <input name="scheduled_at" type="datetime-local" value={form.scheduled_at} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="recurrence" value={form.recurrence} onChange={handleChange} placeholder="Recurrence (e.g. daily, weekly)" className="w-full p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Create'} Schedule</button>
        {editingId && <button type="button" className="ml-2 px-4 py-2 rounded border" onClick={() => { setForm(defaultSchedule); setEditingId(null); }}>Cancel</button>}
      </form>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Content</th>
            <th>Platforms</th>
            <th>Scheduled At</th>
            <th>Recurrence</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(sch => (
            <tr key={sch.id}>
              <td>{sch.content}</td>
              <td>{sch.platforms}</td>
              <td>{sch.scheduled_at?.replace('T', ' ').slice(0, 16)}</td>
              <td>{sch.recurrence}</td>
              <td>{sch.status}</td>
              <td>
                <button className="text-blue-600 mr-2" onClick={() => handleEdit(sch)}>Edit</button>
                <button className="text-red-600" onClick={() => handleDelete(sch.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
