const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');
const Fee = require('./models/Fee');

async function debugGetStudents() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hostel_db');
    console.log("Connected to DB");

    const students = await Student.find({}).populate({
      path: 'userId',
      select: 'email role'
    });
    console.log(`Found ${students.length} students`);

    const studentsWithFees = await Promise.all(students.map(async (student) => {
       try {
         const fee = await Fee.findOne({ studentId: student._id });
         return {
           ...student._doc,
           fee: fee || null
         }
       } catch (innerErr) {
         console.error("Error on student:", student._id, innerErr);
         throw innerErr;
       }
    }));

    console.log("Successfully mapped students", studentsWithFees.length);
    process.exit(0);
  } catch (error) {
    console.error("Server 500 Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugGetStudents();
