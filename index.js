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

// const PORT = process.env.PORT || 8080;



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


app.post('/resetPassword', async (req, res) => {
  const { email, newPassword } = req.body;

  // Find the user by email and update the password
  await User.findOneAndUpdate({ email }, { password: newPassword });

  res.status(200).json({ message: 'Password reset successful' });
});


// Define the admin schema
const adminSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  password: String
});

// Hash the password before saving
adminSchema.pre('save', async function(next) {
  const admin = this;
  if (!admin.isModified('password')) {
    return next();
  }
  const hashedPassword = await bcrypt.hash(admin.password, 10);
  admin.password = hashedPassword;
  next();
});

// Create the Admin model
const Admin = mongoose.model('Admin', adminSchema);

// Now you can use the Admin model to create a new admin instance
app.post('/createAdmin', async (req, res) => {
  const { email, name, role, password } = req.body;

  // Create a new admin instance
  const admin = new Admin({ email, name, role, password });

  // Save the admin to the database
  await admin.save();

  res.status(200).json({ message: 'Admin created successfully' });
});
app.use(express.json());




app.use(express.json());
// // perfect
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     let user;
//     if (email === 'superadmin@example.com') {
//       user = await User.findOne({ email });
//     } else {
//       user = await Admin.findOne({ email });
//       if (!user) {
//         user =  Department.findOne({ 'employees.email': email });
//       }
//     }

//     console.log('Received email:', email);
//     console.log('Received password:', password);
//     console.log('User found:', user);

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       console.log('Invalid credentials');
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     res.json({ role: user.role });
//   } catch (error) {
//     console.error('Login error:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user;
    if (email === 'superadmin@example.com') {
      user = await User.findOne({ email });
    } else {
      user = await Admin.findOne({ email });
      if (!user) {
        const department = await Department.findOne({ 'employees.email': email });
        if (department) {
          user = department.employees.find(emp => emp.email === email);
        }
      }
    }

    console.log('Received email:', email);
    console.log('Received password:', password);
    console.log('User found:', user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log('Invalid credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ role: user.role });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  role: { type: String, required: true } // Add role field
});

const Employee = mongoose.model('Employee', employeeSchema);




// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     let user;
//     // Check if the email belongs to a super admin
//     const superAdmin = await User.findOne({ email });
//     if (superAdmin && superAdmin.email === email && superAdmin.password === password) {
//       user = superAdmin;
//     } else {
//       // Check if the email belongs to an admin
//       const admin = await Admin.findOne({ email });
//       if (admin && admin.email === email && admin.password === password) {
//         user = admin;
//       } else {
//         // Check if the email belongs to a user
//         user = await User.findOne({ email, password });
//       }
//     }

//     if (user) {
//       // User found, return success
//       return res.status(200).json({ message: 'Login successful', user });
//     } else {
//       // User not found, return error
//       return res.status(404).json({ error: 'Invalid credentials' });
//     }
//   } catch (error) {
//     console.error('Error logging in:', error);
//     res.status(500).json({ error: 'An error occurred while logging in' });
//   }
// });


// const employeeSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String
// });
employeeSchema.pre('save', async function(next) {
  const employee = this;
  if (!employee.isModified('password')) {
    return next();
  }
  const hashedPassword = await bcrypt.hash(employee.password, 10);
  employee.password = hashedPassword;
  next();
});

// // Create the Employee model
// const Employee = mongoose.model('Employee', employeeSchema);

const departmentSchema = new mongoose.Schema({
  name: String,
  employees: [employeeSchema]
});

const Department = mongoose.model('Department', departmentSchema);

app.use(bodyParser.json());

app.post('/departments', async (req, res) => {
  const { department } = req.body;

  try {
    const newDepartment = new Department({ name: department });
    await newDepartment.save();
    res.status(201).json(newDepartment);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'An error occurred while creating department.' });
  }
});

// app.post('/departments/:departmentId/employees', async (req, res) => {
//   const { name, email, password } = req.body;
//   const departmentId = req.params.departmentId;

//   try {
//     const department = await Department.findById(departmentId);
//     if (!department) {
//       return res.status(404).json({ error: 'Department not found.' });
//     }

//     const newEmployee = new Employee({ name, email, password });
//     department.employees.push(newEmployee);
//     await department.save();

//     res.status(201).json({ message: 'Employee added successfully.' });
//   } catch (error) {
//     console.error('Error adding employee:', error);
//     res.status(500).json({ error: 'An error occurred while adding employee.' });
//   }
// });
app.post('/departments/:departmentId/employees', async (req, res) => {
  const { name, email, password, role } = req.body;
  const departmentId = req.params.departmentId;

  try {
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ error: 'Department not found.' });
    }

    const newEmployee = new Employee({ name, email, password, role }); // Include role field
    department.employees.push(newEmployee);
    await department.save();

    res.status(201).json({ message: 'Employee added successfully.' });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'An error occurred while adding employee.' });
  }
});




app.listen(5000, () => {
  console.log('Server running on port 5000');
});



