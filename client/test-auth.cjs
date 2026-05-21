const axios = require('axios');

async function test() {
  try {
    const email = 'testadmin_new2@test.com';
    const password = 'password';

    console.log('Signing up...');
    try {
      await axios.post('http://localhost:8080/api/auth/signup', {
        name: 'Test Admin',
        email,
        password
      });
      console.log('Signup successful');
    } catch (e) {
      console.log('Signup error:', e.response?.status, e.response?.data || e.message);
      // Even if it fails (already exists), try to proceed
    }

    console.log('Promoting...');
    try {
      await axios.post(`http://localhost:8080/api/auth/test-promote?email=${email}`);
      console.log('Promoted successfully');
    } catch (e) {
      console.log('Promote error:', e.response?.status, e.response?.data || e.message);
    }

    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:8080/api/auth/signin', { email, password });
    const token = loginRes.data.token;
    console.log('Logged in!');

    const aiPreviewQuiz = {
      title: "Test Quiz",
      questions: [
        {
          frenchText: "Test",
          type: "MCQ",
          options: ["A", "B", "C", "D"],
          correctAnswer: "A"
        }
      ]
    };
    console.log('Testing save quiz...');
    try {
      const saveRes = await axios.post('http://localhost:8080/api/admin/levels/2/quizzes', aiPreviewQuiz, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Save successful! Status:', saveRes.status);
    } catch (e) {
      console.error('Save failed! Status:', e.response?.status);
      console.error('Data:', e.response?.data);
    }

  } catch (err) {
    console.error('Fatal Error:', err.message);
  }
}

test();
