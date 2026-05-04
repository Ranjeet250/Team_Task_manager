const prisma = require('../config/db');
const { validationResult } = require('express-validator');

// @desc    Create a task in a project
// @route   POST /api/projects/:projectId/tasks
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description, priority, dueDate, assignedToId, status } = req.body;

    // Verify assignee is a project member if provided
    if (assignedToId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assignedToId, projectId: req.params.projectId } },
      });
      if (!isMember) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: req.params.projectId,
        assignedToId: assignedToId || null,
        createdById: req.user.id,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedToId } = req.query;

    const where = { projectId: req.params.projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/projects/:projectId/tasks/:taskId
const getTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.taskId, projectId: req.params.projectId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task (full update - admin only)
// @route   PUT /api/projects/:projectId/tasks/:taskId
const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, assignedToId, status } = req.body;

    // Verify assignee is a project member if provided
    if (assignedToId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assignedToId, projectId: req.params.projectId } },
      });
      if (!isMember) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId || null,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ message: 'Task updated', task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status only (any member can do this)
// @route   PATCH /api/projects/:projectId/tasks/:taskId/status
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use: TODO, IN_PROGRESS, DONE' });
    }

    const task = await prisma.task.update({
      where: { id: req.params.taskId },
      data: { status },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ message: 'Status updated', task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/projects/:projectId/tasks/:taskId
const deleteTask = async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard data
// @route   GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    // Get all projects the user is a member of
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      select: { projectId: true, role: true },
    });

    const projectIds = memberships.map((m) => m.projectId);

    // Get task counts by status
    const statusCounts = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId: { in: projectIds } },
      _count: true,
    });

    // Get total tasks
    const totalTasks = statusCounts.reduce((sum, s) => sum + s._count, 0);

    // Get overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        dueDate: { lt: new Date() },
        status: { not: 'DONE' },
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // Get tasks assigned to current user
    const myTasks = await prisma.task.findMany({
      where: {
        assignedToId: req.user.id,
        status: { not: 'DONE' },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // Get active projects count
    const activeProjects = projectIds.length;

    // Format status counts
    const stats = {
      totalTasks,
      todo: statusCounts.find((s) => s.status === 'TODO')?._count || 0,
      inProgress: statusCounts.find((s) => s.status === 'IN_PROGRESS')?._count || 0,
      done: statusCounts.find((s) => s.status === 'DONE')?._count || 0,
      overdue: overdueTasks.length,
      activeProjects,
    };

    res.json({ stats, overdueTasks, myTasks });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask, getTasks, getTask, updateTask, updateTaskStatus, deleteTask, getDashboard,
};
