// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');

// // Create default super admin
// router.post('/create-super-admin', async (req, res) => {
//   try {
//     const superAdminExists = await User.findOne({ role: 'superadmin' });
//     if (superAdminExists) {
//       return res.status(400).json({ error: 'Super admin already exists' });
//     }

//     const hashedPassword = await bcrypt.hash('superadminpassword', 10);
//     const superAdmin = new User({
//       email: 'superadmin@example.com',
//       password: hashedPassword,
//       role: 'superadmin'
//     });

//     await superAdmin.save();
//     res.json({ message: 'Super admin created successfully' });
//   } catch (error) {
//     console.error('Error creating super admin:', error.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     res.json({ role: user.role });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router;
