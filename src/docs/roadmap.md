---
title: Roadmap
---

# Svelte Guardian Roadmap

This document outlines features that are planned for future releases of Svelte Guardian. Some of these features may be mentioned in the documentation but are not yet fully implemented.

## Coming Soon

### Authentication Enhancements

- **Passwordless Authentication**: Support for magic link and OTP-based sign-ins without requiring a password
- **Enhanced Social Login Support**: Additional OAuth providers beyond Google and GitHub
- **Multi-tenant Support**: Ability to isolate authentication across different tenants in a single application

### Security Features
-** Advanced Route Protection**
-** Advanced Route Protection**
-** Advanced Security Configuration**

- **Adaptive MFA**: Context-aware multi-factor authentication based on user behavior and risk patterns
- **Enhanced Brute Force Protection**: More sophisticated detection and prevention mechanisms
- **Customizable Security Rules**: Define your own security rules based on IP, device, and user activity
- **Audit Logs**: Comprehensive logging of all authentication-related events

### Developer Experience

- **Documentstion in types**: Add documentation in types
- **CLI Tool**: Command line interface for scaffolding authentication components
- **UI Component Library**: Ready-to-use UI components for common authentication flows
- **Testing Helpers**: Utilities for testing authentication in your application
- **Environment Variable Configuration**: Simplified configuration via environment variables

## In Progress

These features are currently under development:

- **Improved Email Verification Flow**: More reliable email verification with customizable templates
- **Advanced Session Management**: More control over session lifecycle and security
- **Enhanced Role-based Access Control**: More granular permissions and hierarchical roles
- **Custom Email Templates**: Basic customization will supported soon, with a full template editor coming after

## Partially Implemented

These features exist but have limited functionality in the current version:

- **Two-factor Authentication**: Basic TOTP support is available, but SMS and email methods are planned
- **Rate Limiting**: Basic rate limiting is in place, but more advanced options are coming

## Request a Feature

If you need a specific feature that isn't listed here, please open an issue on our [GitHub repository](https://github.com/mudiageo/svelte-guardian/issues) with the "feature request" label.
