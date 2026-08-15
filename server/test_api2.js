const mongoose = require('mongoose');

async function test() {
  try {
    // 1. login as admin
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hostel.com',
        password: 'admin123',
        role: 'admin'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    // 2. Create student
    const createRes = await fetch('http://localhost:5000/api/students', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        studentId: 'STU-100',
        name: 'Test Student',
        email: 'test@student.com',
        password: 'password123',
        phone: '1234567890',
        roomNumber: '101'
      })
    });
    
    const createData = await createRes.json();
    if (!createRes.ok) {
      console.error("Create Failed:", createData);
    } else {
      console.log("Created student:", createData);
    }

    // 3. Fetch students
    const studentsRes = await fetch('http://localhost:5000/api/students', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const studentsData = await studentsRes.json();
    if (!studentsRes.ok) {
      console.error("Fetch Failed:", studentsData);
    } else {
      console.log("Students:", studentsData.length);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
