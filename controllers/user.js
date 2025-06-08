import User from '../models/user.js';
import validator from 'validator';
import crypto from 'crypto';

import ErrorHandler from '../middlewares/error.js';
import {catchAsyncError} from '../middlewares/catchAsyncError.js';
import { sendEmail } from '../utils/sendEmail.js';
import { sendToken } from '../utils/sendToken.js';
import { url } from 'inspector';

// ==================== Register User ====================
export const registerUser = catchAsyncError(async (req, res, next) => {
  const { username, email, password, address, phone } = req.body;

  if (!username || !email || !password || !address || !phone) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const isPhoneValid = /^\+91\d{10}$/.test(phone);
  if (!isPhoneValid) return next(new ErrorHandler("Invalid Indian phone number", 400));
  if (username.length < 4) return next(new ErrorHandler("Username must be at least 4 characters", 400));
  if (!validator.isEmail(email)) return next(new ErrorHandler("Invalid email address", 400));

  const existingUser = await User.findOne({
    $or: [{ email, accountVerified: true }, { phone, accountVerified: true }]
  });

  if (existingUser) return next(new ErrorHandler("Email or Phone already in use", 400));

  const attempts = await User.find({
    $or: [{ email, accountVerified: false }, { phone, accountVerified: false }]
  });

  if (attempts.length >= 3) {
    return next(new ErrorHandler("Max attempts reached. Try again later.", 400));
  }

  const user = await User.create({ username, email, password, address, phone });
  const verificationCode = await user.generateVerificationCode();
  await user.save();

  await sendVerificationEmail(verificationCode, email);

  res.status(201).json({ success: true, message: "OTP sent to your email" });
});

// ==================== Send Email ====================
const sendVerificationEmail = async (code, email) => {
  const message = generateEmailTemplate(code);
  await sendEmail({ email, subject: "Verify Your Email", message });
};

const generateEmailTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>OTP</title></head>
<body>
  <h2>Your OTP Code</h2>
  <p>Use this code to verify your account:</p>
  <h1>${otp}</h1>
  <p>This OTP is valid for 10 minutes.</p>
</body>
</html>
`;

// ==================== Verify OTP ====================
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp || otp.length !== 5) {
      return next(new ErrorHandler("Email and OTP are required and must be 5 digits", 400));
    }

    const user = await User.findOne({ email, accountVerified: false }).sort({ createdAt: -1 });
    if (!user) return next(new ErrorHandler("User not found", 400));

    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    if (Date.now() > new Date(user.verificationCodeExpiry).getTime()) {
      return next(new ErrorHandler("OTP Expired", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    user.unverifiedAt = null;

    await user.save({ validateModifiedOnly: true });

    const token = await user.generateToken();
    return sendToken(token, user, 200, "Account verified", res); // <- return here ensures it ends here

  } catch (error) {
    return next(new ErrorHandler(error.message || "OTP verification failed", 500));
  }
};




// resend otp
// ==================== Resend OTP ====================
export const resendOTP = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new ErrorHandler("Email is required", 400));

  const user = await User.findOne({ email, accountVerified: false }).sort({ createdAt: -1 });

  if (!user) return next(new ErrorHandler("User not found or already verified", 404));

  // Optional: Check if a previous OTP is still valid
  const now = Date.now();
  if (user.verificationCodeExpiry && now < new Date(user.verificationCodeExpiry).getTime()) {
    return next(new ErrorHandler("Previous OTP still valid. Please wait before requesting a new one.", 400));
  }

  const verificationCode = await user.generateVerificationCode();
  await user.save({ validateModifiedOnly: true });

  await sendVerificationEmail(verificationCode, email);

  res.status(200).json({
    success: true,
    message: "New OTP sent to your email",
  });
});


// ==================== Login ====================
export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new ErrorHandler("Email and Password required", 400));

  const user = await User.findOne({ email, accountVerified: true }).select("+password");
  if (!user) return next(new ErrorHandler("User not found", 404));

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new ErrorHandler("Incorrect password", 400));

  const token = await user.generateToken();
  sendToken(token, user, 200, "Login successful", res);
});

// ==================== Logout ====================
export const logoutUser = catchAsyncError(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  }).status(200).json({ success: true, message: "Logged out successfully" });
});

// ==================== Forgot Password ====================
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  console.log(req.body);
  
  const user = await User.findOne({ email: req.body.email, accountVerified: true });
  if (!user) return next(new ErrorHandler("User not found", 404));

  const resetToken = await user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #333;">Class Fellow Company</h2>
    <p style="font-size: 16px; color: #444;">
      Hello,
    </p>
    <p style="font-size: 16px; color: #444;">
      We received a request to reset your password. If you made this request, please click the button below to reset your password.
    </p>
    <a href="${resetUrl}" 
       style="display: inline-block; padding: 12px 20px; margin: 20px 0; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
      Reset Password
    </a>
    <p style="font-size: 14px; color: #888;">
      If you didn't request this, please ignore this email. Your account is safe.
    </p>
    <p style="font-size: 14px; color: #aaa;">
      — Class Fellow Team
    </p>
  </div>
`;


  await sendEmail({ email: user.email, subject: "Password Reset", message });


  res.status(200).json({ success: true, message: "Reset email sent",url:resetUrl });
});

// ==================== Reset Password ====================
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() }
  });

  if (!user) return next(new ErrorHandler("Invalid or expired token", 400));
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) return next(new ErrorHandler("Passwords do not match", 400));

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  const token = await user.generateToken();
  sendToken(token, user, 200, "Password reset successful", res);
});

// ==================== Get User Profile ====================
export const getUserDetails = catchAsyncError(async (req, res) => {
  const user = await User.findById(req.headers.id).select("-password");
  res.status(200).json({ success: true, data: user });
});

// ==================== Update Address ====================
export const updateAddress = catchAsyncError(async (req, res) => {
  const { id } = req.headers;
  const { address } = req.body;

  await User.findByIdAndUpdate(id, { address }, { new: true });
  res.status(200).json({ success: true, message: "Address updated successfully" });
});
