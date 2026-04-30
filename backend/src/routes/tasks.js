const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');

const router = express.Router();

async function getMembership(projectId, userId) {
  return prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
}

// GET /api/projects/:projectId/tasks
router.get('/projects/:projectId/tasks', auth, async (req, res) => {
  try {
    const membership = await getMembership(req.params.projectId, req.userId);
    if (!membership) return res.status(403).json({ error: 'Not a member of this project' });

    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:projectId/tasks
router.post('/projects/:projectId/tasks', auth, [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const membership = await getMembership(req.params.projectId, req.userId);
    if (!membership) return res.status(403).json({ error: 'Not a member of this project' });
    if (membership.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    // Validate assignee is a project member
    if (assignedToId) {
      const assigneeMembership = await getMembership(req.params.projectId, assignedToId);
      if (!assigneeMembership) return res.status(400).json({ error: 'Assignee is not a project member' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: req.params.projectId,
        assignedToId: assignedToId || null,
      },
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tasks/:id
router.put('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const membership = await getMembership(task.projectId, req.userId);
    if (!membership) return res.status(403).json({ error: 'Not a member of this project' });

    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    // Members can only update status of their own tasks
    if (membership.role !== 'ADMIN') {
      if (task.assignedToId !== req.userId) {
        return res.status(403).json({ error: 'You can only update tasks assigned to you' });
      }
      // Members can only change status
      const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: { status },
        include: { assignedTo: { select: { id: true, name: true, email: true } } },
      });
      return res.json(updated);
    }

    // Admin can update everything
    if (assignedToId) {
      const assigneeMembership = await getMembership(task.projectId, assignedToId);
      if (!assigneeMembership) return res.status(400).json({ error: 'Assignee is not a project member' });
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId !== undefined ? assignedToId : task.assignedToId,
      },
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const membership = await getMembership(task.projectId, req.userId);
    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
