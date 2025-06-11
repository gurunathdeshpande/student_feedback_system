module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'https://student-feedback-frontend.onrender.com',
    credentials: true
  },
  port: process.env.PORT || 8080
}; 