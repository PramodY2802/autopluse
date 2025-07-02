import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'some_default_jwt_secret';
const JWT_EXPIRES_IN = '1d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// 🔗 Start Google OAuth flow
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: true
  })
);

// 🔁 Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login`,
  }),
  async (req, res) => {
    const user = req.user;

    const payload = { userId: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // 🔁 Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/google-auth-success?token=${token}`);
  }
);

// 🔍 Get user data from token
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await import('../models/User.js').then(m => m.default.findById(decoded.userId));

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

export default router;
