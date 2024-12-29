# AdonisJS 6 Auth Template

## Overview

This is an AdonisJS 6 authentication template designed for building secure user authentication systems. It includes user registration, login, password reset, and access token guard. This template sets up a ready-to-use backend with AdonisJS to manage user authentication and session management.

This AdonisJS 6 Auth Template is a great starting point for implementing authentication in your Node.js applications. You can integrate it with any frontend framework (e.g., React, Vue.js, or Angular) or extend it with more features as required.

## Features

- User Registration: Users can create accounts.
- User Login: Secure login system using JWT for authentication.
- Password Reset: Ability to reset passwords via email.
- Email Verification: Ensures users verify their email addresses before gaining full access to the system.
- Access Token Guard: Token-based authentication for secure API access.
- Modular & Scalable: Built in a way that is easy to scale and extend for larger applications.

## Getting Started

### Prerequisites

Before getting started, make sure you have the following installed:

- Node.js: Required to run the AdonisJS backend.
- npm or Yarn: For managing JavaScript dependencies.
- PostgreSQL: Or any other database supported by AdonisJS (can be configured in config/database.ts).

### Installation

1. Clone the repository

Clone the repository to your local machine:

```
https://github.com/repiyann/adonis6-auth-template.git
```

2. Install Node.js dependencies

Navigate to the project folder and install the required dependencies:

```
cd adonis6-auth-template
npm install
```

3. Set up environment variables

Copy the .env.example file to .env:

```
cp .env.example .env
```

Then, configure the necessary environment variables, such as the database connection settings and SMTP provider for password resets.

4. Run Database Migrations

Run the database migrations to create the necessary tables (e.g., users table for authentication):

```
node ace migration:run
```

5. Generate App Key

Generate the application key, which is required for encryption:

```
node ace generate:key
```

### Running the Application

1. Run for HMR (Hot Module Replacement)

Start the development server to enable Hot Module Replacement:

```
npm run dev
```

2. Access API Endpoints

You can access the following API endpoints:

- POST /api/v1/auth/register: Register a new user.
- POST /api/v1/auth/login: Login and receive an access token.
- GET /api/v1/auth/profile: Get user profile.
- POST /api/v1/auth/logout: Logout the user.
- POST /api/v1/auth/password/forgot: Initiates the password reset process.
- GET /api/v1/auth/password/reset/:token: Verifies the password reset token.
- POST /api/v1/auth/password/reset: Resets the user’s password.
- GET /api/v1/auth/verify/email/:token: Verifies the email verification token.
- POST /api/v1/auth/verifiy/request: Request new email verification token

## Notes

Work in Progress: Some features, such as password reset are still being developed.
