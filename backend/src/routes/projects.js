const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: check if user is admin of project
async function requireAdmin(projectId, userId, res) {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!member || member.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return false;
  }
  return true;
}

// Helper: check if user is member of project
async function requireMember(projectId, userId, res) {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!member) {
    res.status(403).json({ error: 'Not a member of this project' });
    return false;
  }
  return true;
}

// GET /api/projects
router.get('/', auth, async (req, res) => {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.userId },
      include: {
        project: {
          include: {
            admin: { select: { id: true, name: true, email: true } },
            _count: { select: { members: true, tasks: true } },
          },
        },
      },
    });
    const projects = memberships.map(m => ({ ...m.project, role: m.role }));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Project name required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, description } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        adminId: req.userId,
        members: {
          create: { userId: req.userId, role: 'ADMIN' },
        },
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });
    res.status(201).json({ ...project, role: 'ADMIN' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const ok = await requireMember(req.params.id, req.userId, res);
    if (!ok) return;

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tasks: {
          include: { assignedTo: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.userId, projectId: req.params.id } },
    });

    res.json({ ...project, role: membership.role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/projects/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const ok = await requireAdmin(req.params.id, req.userId, res);
    if (!ok) return;

    const { name, description } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const ok = await requireAdmin(req.params.id, req.userId, res);
    if (!ok) return;

    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:id/members  (add member by email)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const ok = await requireAdmin(req.params.id, req.userId, res);
    if (!ok) return;

    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: req.params.id } },
    });
    if (existing) return res.status(400).json({ error: 'User already a member' });

    const member = await prisma.projectMember.create({
      data: { userId: user.id, projectId: req.params.id, role: 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const ok = await requireAdmin(req.params.id, req.userId, res);
    if (!ok) return;

    if (req.params.userId === req.userId) {
      return res.status(400).json({ error: 'Admin cannot remove themselves' });
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId: req.params.userId, projectId: req.params.id } },
    });
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
