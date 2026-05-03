import User from '../models/auth.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

export const signup = async (req, res) => {
console.log(req.body);
const { name, email, password, role } = req.body;
try {
    // Ensure all fields are provided
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user (unverified)
    const newUser = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      verificationToken 
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2d6a4f; text-align: center;">Welcome to Agri-One!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with Agri-One. Please verify your email address to activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2d6a4f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">If you didn't create an account, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: newUser.email,
        subject: 'Verify your Agri-One Account',
        html: emailHtml
      });
      return res.status(201).json({ message: "Verification email sent. Please check your inbox." });
    } catch (emailErr) {
      console.error("DETAILED EMAIL ERROR:", emailErr);
      return res.status(400).json({ 
        message: "User created, but email failed to send.",
        error: emailErr.message 
      });
    }
  } catch (err) {
    console.error("SIGNUP GENERAL ERROR:", err);
    return res.status(500).json({ message: err.message || "Something went wrong" });
}
};

export const signin = async (req, res) => {
console.log(req.body);
const { email, password, role } = req.body;
try {
    console.log(role);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email first." });
    }

    if(role !== user.role) return res.status(404).json({message: "Invalid Credentials"});
    
    // Validate password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "10h" }
    );

    // Set token in cookie
    if(token.length > 0){
        return res
            .cookie('token', token, {secure: true, sameSite: 'None'})  // Setting cookie})
            .status(200)
            .json({ message: "Logged in successfully", token, role: user.role, id: user._id });
    }
} catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
}
};

export const signout = async (req, res) => {
// Clear the cookie on logout
    res.clearCookie('token',{secure: true, sameSite: 'None'});
    return res.status(200).json({ message: 'Logged out successfully' });
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong during verification." });
  }
};

export const getUserProfile = async (req, res) => {
try {
    // Retrieve user profile excluding the password
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);    
} catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
}
};
