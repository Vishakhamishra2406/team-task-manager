const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/:projectId
router.get('/:projectId', auth, async (req, res) => {
  try {
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.userId, projectId: req.params.projectId } },
    });
    if (!membership) return res.status(403).json({ error: 'Not a member of this project' });

    const now = new Date();

    const [total, byStatus, overdue, tasksByUser] = await Promise.all([
      prisma.task.count({ where: { projectId: req.params.projectId } }),

      prisma.task.groupBy({
        by: ['status'],
        where: { projectId: req.params.projectId },
        _count: { status: true },
      }),

      prisma.task.count({
        where: {
          projectId: req.params.projectId,
          dueDate: { lt: now },
          status: { not: 'DONE' },
        },
      }),

      prisma.task.groupBy({
        by: ['assignedToId'],
        where: { projectId: req.params.projectId, assignedToId: { not: null } },
        _count: { assignedToId: true },
      }),
    ]);

    // Enrich tasksByUser with user info
    const userIds = tasksByUser.map(t => t.assignedToId).filter(Boolean);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const tasksByUserEnriched = tasksByUser.map(t => ({
      user: userMap[t.assignedToId] || null,
      count: t._count.assignedToId,
    }));

    res.json({
      total,
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count.status })),
      overdue,
      tasksByUser: tasksByUserEnriched,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
