---
title: "Introduction to Svelte Guardian"
description: "An overview of Svelte Guardian for SvelteKit applications."
date: "2025-05-22"
---

# Introduction to Svelte Guardian

Welcome to Svelte Guardian, a comprehensive authentication solution designed specifically for SvelteKit applications. This guide will introduce you to the core concepts and capabilities of Svelte Guardian.

## What is Svelte Guardian?

Svelte Guardian is a batteries-included authentication library that provides robust authentication and authorization capabilities for your SvelteKit applications. Built with security and flexibility in mind, it abstracts complex authentication flows into simple-to-use APIs while giving you full control over how users sign in and access your application.

## Key Features

- **Multiple Authentication Methods**: Support for credentials (email/password), OAuth providers (Google, GitHub, etc.), and more
- **Security First**: Built-in protections against common security threats like brute force attacks and CSRF
- **Email Verification**: Out-of-the-box email verification with customizable templates
- **Password Reset**: Secure password reset functionality
- **Two-Factor Authentication**: Add an extra layer of security with TOTP-based 2FA
- **Role-Based Access Control**: Easily protect routes based on user roles and permissions
- **Customizable**: Extensive configuration options to adapt to your specific requirements
- **TypeScript Support**: Full TypeScript definitions for improved developer experience

## Architecture Overview

Svelte Guardian follows a middleware-based architecture that integrates seamlessly with SvelteKit's hooks system:

1. **Authentication Middleware**: Manages user sessions, authentication state, and route protection
2. **Providers**: Handle different authentication methods (credentials, OAuth, etc.)
3. **Adapters**: Connect to various database backends for storing user data
4. **Security Module**: Implements security features like rate limiting and CSRF protection
5. **Email Service**: Handles sending verification emails, password reset links, etc.

## When to Use Svelte Guardian

Svelte Guardian is ideal for:

- SvelteKit applications requiring user authentication
- Projects needing multiple authentication methods
- Applications with complex authorization requirements
- Situations where security is a top priority

## Getting Started

To start using Svelte Guardian in your SvelteKit project, follow our step-by-step [installation guide](./installation.md) and explore the various [configuration options](./configuration.md).

## Prerequisites

Before getting started with Svelte Guardian, ensure you have:

- A SvelteKit project (v2.0.0 or higher)
- Node.js (v20 or higher)
- A database for storing user information (Prisma is recommended)
