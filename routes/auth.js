import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'some_default_jwt_secret';
const JWT_EXPIRES_IN = '1d';

// 🔗 Initiate Google login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 🔁 Handle Google callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    const user = req.user;

    // 🪙 Create JWT
    const payload = { userId: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // 🔁 Redirect back to frontend with token
    res.redirect(`http://localhost:3000/google-auth-success?token=${token}`);
  }
);

// 🧠 Optional: Route to return user info after token-based login
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Unauthorized' });

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

// ✅ Don't forget this line!
export default router;
