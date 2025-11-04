const { PostSchedule, User, Post } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../config/logger');

// Create a new schedule
const createSchedule = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { content, platforms, scheduled_at, recurrence } = req.body;
  const schedule = await PostSchedule.create({
    user_id: userId,
    content,
    platforms,
    scheduled_at,
    recurrence,
    status: 'pending',
  });
  res.status(201).json({ status: true, message: 'Schedule created', data: { schedule } });
});

// Get all schedules for user
const getUserSchedules = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const schedules = await PostSchedule.findAll({
    where: { user_id: userId },
    order: [['scheduled_at', 'ASC']],
  });
  res.json({ status: true, data: { schedules } });
});

// Update a schedule
const updateSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { content, platforms, scheduled_at, recurrence, status } = req.body;
  const schedule = await PostSchedule.findOne({ where: { id, user_id: userId } });
  if (!schedule) return res.status(404).json({ status: false, message: 'Schedule not found' });
  await schedule.update({ content, platforms, scheduled_at, recurrence, status });
  res.json({ status: true, message: 'Schedule updated', data: { schedule } });
});

// Delete a schedule
const deleteSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const schedule = await PostSchedule.findOne({ where: { id, user_id: userId } });
  if (!schedule) return res.status(404).json({ status: false, message: 'Schedule not found' });
  await schedule.destroy();
  res.json({ status: true, message: 'Schedule deleted' });
});

// List all schedules (admin)
const getAllSchedules = asyncHandler(async (req, res) => {
  const schedules = await PostSchedule.findAll({ order: [['scheduled_at', 'ASC']] });
  res.json({ status: true, data: { schedules } });
});

module.exports = {
  createSchedule,
  getUserSchedules,
  updateSchedule,
  deleteSchedule,
  getAllSchedules,
};
