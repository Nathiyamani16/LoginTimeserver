// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const dotenv = require('dotenv');
// const cors = require('cors');

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(async () => {
//   console.log('Connected to MongoDB');

//   // User Schema
//   const userSchema = new mongoose.Schema({
//     email: {
//       type: String,
//       required: true,
//       unique: true
//     },
//     password: {
//       type: String,
//       required: true
//     },
//     role: {
//       type: String,
//       enum: ['user', 'admin', 'superadmin'],
//       default: 'user'
//     }
//   });

//   const User = mongoose.model('User', userSchema);

//   // Create default super admin if it doesn't exist
//   const superAdmin = await User.findOne({ role: 'superadmin' });
//   if (!superAdmin) {
//     const hashedPassword = await bcrypt.hash('superadminpassword', 10);
//     const newSuperAdmin = new User({
//       email: 'superadmin@example.com',
//       password: hashedPassword,
//       role: 'superadmin'
//     });
//     await newSuperAdmin.save();
//     console.log('Super admin created successfully');
//   }
// }).catch(err => {
//   console.error('MongoDB connection error:', err.message);
// });

// // Start the server
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
// server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const emailjs = require('emailjs-com');


const app = express();

const PORT = process.env.PORT || 8080;



// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Tron', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a MongoDB model for users
const User = mongoose.model('User', {
  email: String,
  password: String,
  role: String, // 'superAdmin', 'admin', 'employee'
});
app.use(cors());

app.use(bodyParser.json());



// Super admin creation (ensure it runs only once)
const createSuperAdmin = async () => {
  const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('superadminpassword', 10);
    const superAdmin = new User({
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: 'superAdmin',
    });
    await superAdmin.save();
    console.log('Super admin created successfully');
  }
};

createSuperAdmin();

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.post('/resetPassword', async (req, res) => {
  const { email, newPassword } = req.body;

  // Find the user by email and update the password
  await User.findOneAndUpdate({ email }, { password: newPassword });

  res.status(200).json({ message: 'Password reset successful' });
});


const adminSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  password: String
});

const Admin = mongoose.model('Admin', adminSchema);

app.use(express.json());




app.use(express.json());

// Create admin endpoint
// Create admin endpoint
app.post('/createAdmin', async (req, res) => {
  const { email, name, role, password } = req.body;

  // Save admin to MongoDB
  const admin = new Admin({ email, name, role, password });
  await admin.save();

  res.status(200).json({ message: 'Admin created successfully' });
});



app.listen(8080, () => {
  console.log('Server running on port 8080');
});



