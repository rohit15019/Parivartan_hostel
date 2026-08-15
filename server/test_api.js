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
    
    if (!loginRes.ok) {
      console.error("Login failed:", loginData);
      return;
    }
    
    const token = loginData.token;
    console.log("Logged in successfully, token:", token.substring(0, 15) + "...");
    
    // 2. Fetch students
    const studentsRes = await fetch('http://localhost:5000/api/students', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const studentsData = await studentsRes.json();
    if (!studentsRes.ok) {
      console.error("Error Response Data:", studentsData);
    } else {
      console.log("Students:", studentsData);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
