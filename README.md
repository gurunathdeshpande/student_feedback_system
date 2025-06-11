# Student Feedback System

A modern web application for managing student feedback with continuous integration and deployment.

## CI/CD Setup

This project uses GitHub Actions for continuous integration and deployment. The following checks are performed on each push and pull request:

- Code linting (ESLint)
- Unit tests with coverage requirements
- Code quality analysis (SonarCloud)
- Build verification
- Docker image building and testing

### Prerequisites

1. GitHub repository secrets:
   - `SONAR_TOKEN`: SonarCloud authentication token
   - `DOCKER_USERNAME`: Docker Hub username (for image publishing)
   - `DOCKER_PASSWORD`: Docker Hub password
   - Additional environment-specific secrets as needed

2. SonarCloud setup:
   - Create a SonarCloud account
   - Set up your organization
   - Update `sonar.organization` in `sonar-project.properties`

### CI Workflow

The CI pipeline consists of the following stages:

1. **Code Quality**
   - Linting (ESLint)
   - Code formatting (Prettier)
   - SonarCloud analysis

2. **Testing**
   - Unit tests
   - Integration tests
   - Coverage reports

3. **Build**
   - Frontend build
   - Backend build
   - Docker image creation

### Local Development

1. Install dependencies:
   ```bash
   npm run install-all
   ```

2. Run tests:
   ```bash
   # Frontend
   cd frontend
   npm run test
   npm run test:coverage

   # Backend
   cd backend
   npm run test
   npm run test:coverage
   ```

3. Run linting:
   ```bash
   # Frontend
   cd frontend
   npm run lint
   npm run lint:fix

   # Backend
   cd backend
   npm run lint
   npm run lint:fix
   ```

4. Start development servers:
   ```bash
   npm start
   ```

### Quality Gates

The following quality gates must pass for successful CI:

- Test coverage: 80% minimum
- No critical or blocker issues in SonarCloud
- All tests passing
- No linting errors
- Successful Docker build and test

### Branch Protection Rules

Set up the following branch protection rules in GitHub:

1. `main` branch:
   - Require status checks to pass
   - Require code review
   - No direct pushes
   - Up-to-date branch required

2. `develop` branch:
   - Require status checks to pass
   - Require code review
   - Up-to-date branch required

## License

ISC 