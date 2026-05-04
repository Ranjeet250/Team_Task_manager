const prisma = require('../config/db');
const { validationResult } = require('express-validator');

// @desc    Create a new project
// @route   POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
    });

    res.status(201).json({ message: 'Project created', project });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Calculate progress for each project
    const projectsWithProgress = projects.map((project) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((t) => t.status === 'DONE').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const { tasks, ...rest } = project;
      return { ...rest, progress, totalTasks, completedTasks };
    });

    res.json({ projects: projectsWithProgress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project with details
// @route   GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
    });

    res.json({ message: 'Project updated', project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project and all related data
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project by email
// @route   POST /api/projects/:id/members
const addMember = async (req, res, next) => {
  try {
    const { email, role = 'MEMBER' } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: req.params.id } },
    });

    if (existingMember) {
      return res.status(409).json({ message: 'User is already a member of this project' });
    }

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: req.params.id,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ message: 'Member added', member });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const projectId = req.params.id;

    // Don't allow removing the owner
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project.ownerId === userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    });

    // Unassign tasks from removed member
    await prisma.task.updateMany({
      where: { projectId, assignedToId: userId },
      data: { assignedToId: null },
    });

    res.json({ message: 'Member removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Change member role
// @route   PATCH /api/projects/:id/members/:userId
const changeMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;
    const projectId = req.params.id;

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const member = await prisma.projectMember.update({
      where: { userId_projectId: { userId, projectId } },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json({ message: 'Role updated', member });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject, getProjects, getProject, updateProject, deleteProject,
  addMember, removeMember, changeMemberRole,
};
