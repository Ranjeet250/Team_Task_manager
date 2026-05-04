const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  createProject, getProjects, getProject, updateProject, deleteProject,
  addMember, removeMember, changeMemberRole,
} = require('../controllers/projectController');

const taskRoutes = require('./taskRoutes');

const router = express.Router();

// Nest task routes under projects
router.use('/:projectId/tasks', protect, taskRoutes);

// Project CRUD
router.post(
  '/',
  protect,
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  createProject
);

router.get('/', protect, getProjects);

router.get('/:id', protect, authorize('ADMIN', 'MEMBER'), getProject);

router.put('/:id', protect, authorize('ADMIN'), updateProject);

router.delete('/:id', protect, authorize('ADMIN'), deleteProject);

// Member management
router.post('/:id/members', protect, authorize('ADMIN'), addMember);

router.delete('/:id/members/:userId', protect, authorize('ADMIN'), removeMember);

router.patch('/:id/members/:userId', protect, authorize('ADMIN'), changeMemberRole);

module.exports = router;
