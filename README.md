# Student Feedback System

A modern web application for managing student feedback and academic performance tracking.

## Continuous Integration

This project uses GitHub Actions for Continuous Integration. The CI pipeline automatically runs on:
- Every push to main/master branch
- Every pull request to main/master branch

### CI Pipeline Steps

1. **Environment Setup**
   - Uses Ubuntu latest runner
   - Sets up Node.js (versions 16.x and 18.x)
   - Configures npm cache

2. **Backend Checks**
   - Installs dependencies
   - Runs linting
   - Executes tests

3. **Frontend Checks**
   - Installs dependencies
   - Runs linting
   - Executes tests
   - Builds the application

### Running Tests Locally

Before pushing your changes, you can run the same checks locally:

**Backend:**
```bash
cd backend
npm install
npm run lint
npm test
```

**Frontend:**
```bash
cd frontend
npm install
npm run lint
npm test
npm run build
```

## Development Setup

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up environment variables
4. Start the development servers

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create `.env` files in both frontend and backend directories with the necessary environment variables.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Ensure all tests pass locally
4. Create a pull request
5. Wait for CI checks to pass
6. Request review 