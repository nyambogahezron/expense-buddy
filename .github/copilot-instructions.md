# Expense Buddy - AI Coding Guidelines

## Architecture Overview

- **Backend**: Django REST API with JWT authentication via HTTP-only cookies (not Authorization headers)
- **Frontend**: React/TypeScript with Vite (currently landing page only)
- **Database**: SQLite with user-scoped data models
- **Key Components**: `api/` (main app), `apiAuth/` (authentication), custom middleware for request logging

## Authentication & Security

- Uses `rest_framework_simplejwt` with cookie-based auth (`access_token` cookie)
- Custom `AuthenticateUser` permission class extracts user from cookies, not headers
- CORS configured for `localhost:5173` with credentials enabled
- All data models have `user` foreign keys for data isolation

## API Patterns

- ViewSets with complex filtering: search, date ranges, category filtering, sorting
- Custom exception handler in `api.exceptions.custom_exception_handler`
- Request logging middleware tracks API usage and performance
- Serializer patterns: nested relationships (e.g., `category_detail` in BudgetSerializer)

## Data Models

- **Core Entities**: Transaction, Category, Budget, UserCategory (many-to-many bridge)
- **User Isolation**: All data filtered by `request.user` in ViewSets
- **Relationships**: Transactions link to Categories and optional Budgets
- **File Uploads**: Receipt images stored in `receipts/` directory

## Background Tasks

- Management commands for scheduled operations:
  - `send_notification_emails`: Groups user notifications into digest emails
  - `send_reports`: Processes periodic financial reports
- Email templates in `templates/` directory using Django template engine
- Uses `django.core.mail` with SMTP configuration

## Development Workflow

- **Backend Setup**: `cd server && python manage.py migrate && python manage.py runserver`
- **Frontend Setup**: `cd web && npm install && npm run dev`
- **Database**: SQLite with migrations in `api/migrations/`
- **Environment**: Uses `python-decouple` for config management

## Key Conventions

- **URL Structure**: `/api/v1/` prefix with DRF DefaultRouter
- **Permissions**: `IsAuthenticated`, `AuthenticateUser`, `IsOwnTransaction` classes
- **Error Handling**: Custom exception handler returns JSON error responses
- **Email**: Templates rendered with user context, verification required before sending

## Common Patterns

- **Filtering**: Query parameters for search, type, date ranges, category
- **User Context**: Always attach `user` field in serializers, filter by `request.user`
- **Cookie Auth**: Check `request.COOKIES.get("access_token")` for authentication
- **Management Commands**: Use for scheduled tasks, not cron jobs directly</content>
  <parameter name="filePath">/home/junior/Projects/expense-buddy/.github/copilot-instructions.md
