const express = require('express');
const { body } = require('express-validator');
const { authorize } = require('../middleware/authorize');
const {
  createTask, getTasks, getTask, updateTask, updateTaskStatus, deleteTask,
} = require('../controllers/taskController');

// mergeParams: true allows access to :projectId from parent router
const router = express.Router({ mergeParams: true });

router.post(
  '/',
  authorize('ADMIN'),
  [body('title').trim().notEmpty().withMessage('Task title is required')],
  createTask
);

router.get('/', authorize('ADMIN', 'MEMBER'), getTasks);

router.get('/:taskId', authorize('ADMIN', 'MEMBER'), getTask);

router.put('/:taskId', authorize('ADMIN'), updateTask);

router.patch('/:taskId/status', authorize('ADMIN', 'MEMBER'), updateTaskStatus);

router.delete('/:taskId', authorize('ADMIN'), deleteTask);

module.exports = router;
