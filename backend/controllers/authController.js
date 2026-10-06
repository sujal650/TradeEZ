const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const store = require('../services/store');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_stockez_2026_smartbridge_mern',
    { expiresIn: '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await store.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const initialBalance = Number(process.env.INITIAL_VIRTUAL_BALANCE) || 50000;
    const user = await store.createUser({
      name,
      email,
      password,
      role: 'USER',
      virtualBalance: initialBalance
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! $50,000 in virtual funds credited.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        virtualBalance: user.virtualBalance,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        virtualBalance: user.virtualBalance,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile & balance
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await store.findUserById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        virtualBalance: user.virtualBalance,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset virtual balance to initial $50,000
// @route   POST /api/auth/reset-balance
// @access  Private
const resetBalance = async (req, res, next) => {
  try {
    const initialBalance = Number(process.env.INITIAL_VIRTUAL_BALANCE) || 50000;
    const user = await store.updateUser(req.user._id || req.user.id, {
      virtualBalance: initialBalance
    });

    res.status(200).json({
      success: true,
      message: `Virtual balance reset to $${initialBalance.toLocaleString()}.`,
      virtualBalance: user.virtualBalance
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  resetBalance
};
