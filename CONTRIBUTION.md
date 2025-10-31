# Contributing to Expense Buddy

Thank you for your interest in contributing to Expense Buddy! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/expense-buddy.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `python manage.py test` (for backend) or `npm test` (for frontend)
6. Commit your changes: `git commit -m "Add your message"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

### Backend (Django)

1. Navigate to the server directory: `cd server`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Start the development server: `python manage.py runserver`

### Frontend (React)

1. Navigate to the web directory: `cd web`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Code Style

- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/TypeScript
- Write clear, concise commit messages
- Add tests for new features

## Pull Request Guidelines

- Ensure your PR has a clear title and description
- Reference any related issues
- Make sure all tests pass
- Update documentation if necessary
- Keep PRs focused on a single feature or fix

## Code of Conduct

Please be respectful and constructive in all interactions. We follow a code of conduct to ensure a positive environment for all contributors.

## Questions?

If you have any questions, feel free to open an issue or contact the maintainers.
