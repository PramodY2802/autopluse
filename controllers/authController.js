// /controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'some_default_jwt_secret';
const JWT_EXPIRES_IN = '1d'; // Adjust as desired

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // 3. Create user
    const user = await User.create({
      name,
      email,
      password: hashed
    });

    // 4. Return 201 + user data (omit password in response)
    const { _id, createdAt, updatedAt } = user;
    return res.status(201).json({
      user: { id: _id, name, email, createdAt, updatedAt }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT
    const payload = { userId: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate and store 4-digit OTP, set expiration, return success
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = expires;
    await user.save();

    // ✅ Setup transporter (Gmail example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER, // your Gmail address
        pass: process.env.SMTP_PASS  // your Gmail app password (not regular password)
      }
    });

    const mailOptions = {
      from: '"AutoPulse Support" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Your OTP Code - AutoPulse',
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: 'OTP sent to your email' });

  } catch (err) {
    console.error('ForgotPassword error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify the 4-digit OTP
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // 2. Check expiry
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // 3. Compare OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    // 4. Clear OTP fields (optional, but recommended)
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // 5. Return success, client can now show Reset Password form
    return res.json({ message: 'OTP verified, proceed to reset password' });
  } catch (err) {
    console.error('VerifyOtp error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset the user's password after OTP verification
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // 2. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    // 3. Update user password, clear OTP (just in case), and save
    user.password = hashed;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('ResetPassword error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
