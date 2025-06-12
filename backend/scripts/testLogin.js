const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/login', {
      email: 'test@example.com',
      password: 'Test@123'
    });
    console.log('Login response:', response.data);
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
  }
}

testLogin(); 