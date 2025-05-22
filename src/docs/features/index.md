---
title: "Features Overview"
description: "Overview of authentication and authorization features in Svelte Guardian."
date: "2025-05-22"
---

# Features Overview

Svelte Guardian provides a comprehensive set of authentication and authorization features for your SvelteKit applications. Here's an overview of the key features.

## Authentication Methods

### Credentials Authentication
- Email and password authentication
- Custom login validation
- Registration with customizable fields
- Password hashing and security
- Login attempt limiting

### OAuth Authentication
- Multiple OAuth providers (Google, GitHub, Microsoft, Facebook, etc.)
- Customizable OAuth scopes and profiles
- Account linking between multiple providers
- Authentication callbacks

## Security Features

### Email Verification
- OTP (One-Time Password) verification
- Email verification links
- Customizable email templates
- Verification token management

### Password Reset
- Secure password reset flow
- Timed reset tokens
- Email notifications
- Password policy enforcement

### Two-Factor Authentication (2FA)
- Time-based One-Time Password (TOTP) support
- Email code verification
- Backup codes for account recovery
- QR code generation for authenticator apps

### Rate Limiting
- Protection against brute force attacks
- Multiple rate limiting strategies (memory, Redis, Upstash)
- Customizable rate limits per route
- Blocking with customizable duration

### Session Management
- Secure session handling
- JWT and database session options
- Session expiration and renewal
- Cross-site request forgery (CSRF) protection

## Authorization

### Role-Based Access Control
- User role assignment and verification
- Route protection based on roles
- Authorization middleware
- Custom permission strategies

### Route Protection
- Public and protected route configuration
- Authenticated route guards
- Role-specific access control
- Custom redirect paths

## Database Integration

### Adapters
- Prisma adapter for SQL databases
- Mongoose adapter for MongoDB
- Custom adapter support for any database

### Schema
- Pre-defined database schema for users, accounts, and sessions
- Extensible user model with custom fields
- Verification token and password reset storage

## Email

### Email Providers
- Nodemailer (SMTP) support
- SendGrid integration
- Amazon SES support
- Resend.com integration
- Testing mode with console logging

### Email Templating
- Customizable HTML and text templates
- Dynamic content interpolation
- Themed emails
- Localization support

## Middleware and Hooks

### SvelteKit Integration
- Server hooks integration
- Client-side helpers
- Form actions for authentication
- Load function utilities

### Custom Middleware
- Extensible middleware architecture
- Security headers management
- API endpoint protection
- Rate limiting middleware

## Logging and Events

### Event System
- Authentication events (sign in, sign out, etc.)
- User creation and update events
- Account linking events
- Error events

### Logging
- Configurable logging levels
- Console and file logging
- Remote logging support
- Security event logging

## Client-Side Integration

### Form Helpers
- Sign-in form integration
- Sign-up form integration
- Password reset forms
- Email verification UI

### UI Components
- Optional pre-built authentication components
- Dark mode support
- Tailwind CSS integration
- Customizable styling

## Customization

### Configuration
- Extensive configuration options
- Environment variable integration
- Development and production modes
- Custom providers and strategies

### Extensibility
- Plugin architecture
- Custom authentication providers
- Custom event handlers
- Custom security policies

## Feature Comparison

| Feature                | Basic         | Memory Store   | Database Store | Redis Store    |
|------------------------|---------------|----------------|----------------|----------------|
| Email/Password Auth    | ✓             | ✓              | ✓              | ✓              |
| OAuth                  | ✓             | ✓              | ✓              | ✓              |
| Email Verification     | ✓             | ✓              | ✓              | ✓              |
| Password Reset         | ✓             | ✓              | ✓              | ✓              |
| Rate Limiting          | ✓             | In-memory      | Database-based | Redis-based    |
| Session Storage        | Cookie        | Memory         | Database       | Redis          |
| Two-Factor Auth        | ✗             | ✓              | ✓              | ✓              |
| Account Linking        | ✗             | ✓              | ✓              | ✓              |
| Scalability            | Single server | Single server  | Horizontal     | Horizontal     |
| Persistence            | ✗             | ✗              | ✓              | ✓              |
| Serverless Compatible  | ✓             | ✗              | ✓              | ✓ (with Upstash)|