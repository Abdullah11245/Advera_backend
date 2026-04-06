require('dotenv').config();
const express = require('express');
const cors = require('cors');

const portfolioRoutes = require('./routes/portfolioRoutes');
const blogRoutes = require('./routes/blogRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const { notFound, errorHandler } = require('./middleware/errorHandler');

// 👇 Add this
const User = require('./models/User'); 
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/portfolio', portfolioRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/bookings', bookingRoutes);



app.post('/api/auth/login', async (req, res) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const { email, password } = payload;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // 2. Find user (only one admin in DB)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Return user (NO TOKEN needed for your case)
    res.json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        role: user.role || 'Admin', // ensure admin
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/create-admin', async (req, res) => {
  try {
    const payload =
      req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0
        ? req.body
        : req.query;
    const { name, email, password } = payload || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email and password required',
        hint: 'Send JSON body with Content-Type: application/json or use query params.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ error: 'Admin already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'Admin',
    });

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// =============================

app.use(notFound);
app.use(errorHandler);

module.exports = app;
