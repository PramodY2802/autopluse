// /routes/authRoutes.js
import express from 'express';
import {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login existing user
router.post('/login', login);

// Generate OTP for forgot password
router.post('/forgot-password', forgotPassword);

// Verify the 4-digit OTP
router.post('/verify-otp', verifyOtp);

// Reset password after OTP verification
router.post('/reset-password', resetPassword);

export default router;
