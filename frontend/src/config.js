const config = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://student-feedback-backend-q161.onrender.com'
    : 'http://localhost:4000',
  frontendUrl: process.env.NODE_ENV === 'production'
    ? 'https://student-feedback-frontend-i92f.onrender.com'
    : 'http://localhost:3000'
};

export default config; 