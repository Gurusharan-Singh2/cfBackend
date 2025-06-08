import express from 'express';
import {
  registerUser,
  verifyOTP,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updateAddress,
  resendOTP
} from '../controllers/user.js';


import auth from '../middlewares/UserAuth.js';

const router = express.Router();

// Auth Routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp',resendOTP)
router.post('/login', loginUser);
router.get('/logout', auth, logoutUser);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// User Profile Routes
router.get('/get-user', auth, getUserDetails);
router.put('/update-address', auth, updateAddress);

export default router;
