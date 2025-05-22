---
title: "Installation"
description: "How to install and set up Svelte Guardian in your SvelteKit project."
date: "2025-05-22"
---

# Installing Svelte Guardian

This guide will walk you through the process of installing Svelte Guardian and setting up the necessary dependencies for your SvelteKit project.

## Package Installation

Install Svelte Guardian using your preferred package manager:

```bash
# Using npm
npm install svelte-guardian

# Using pnpm
pnpm add svelte-guardian

# Using yarn
yarn add svelte-guardian
```

## Database Setup

Svelte Guardian requires a database to store user accounts and authentication-related data. While any database system compatible with SvelteKit can work, we recommend using Prisma for the best developer experience.

### Setting Up Prisma

1. Install Prisma and the Prisma adapter:

```bash
npm install prisma @prisma/client @auth/prisma-adapter
npx prisma init
```

2. Configure your database connection in the `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase"
```

> **Note**: You can use other databases supported by Prisma such as MySQL, SQLite, MongoDB, etc.

3. Add the required schema to your `prisma/schema.prisma` file:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "mysql", "sqlite", "sqlserver", "mongodb"
  url      = env("DATABASE_URL")
}

model Account {
  id                String    @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?   @db.Text
  access_token      String?   @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?   @db.Text
  session_state     String?
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  expires      DateTime
  sessionToken String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  password      String?
  image         String?
  role          String?   @default("user")
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  id          String   @id @default(cuid())
  identifier  String
  token       String   @unique
  expires     DateTime
  type        String?

  @@unique([identifier, token])
}
```

4. Run the migration to create the database schema:

```bash
npx prisma migrate dev --name initial-setup
```

## Environment Variables

Create or update your `.env` file with the necessary environment variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase"

# Authentication
AUTH_SECRET="your-secure-secret-key" # Generate with: openssl rand -base64 32
AUTH_TRUST_HOST=true

# Email (for verification & password reset)
EMAIL_USER="your-email@gmail.com"
EMAIL_APP_PASSWORD="your-app-password"
```

> **Security Note**: Never commit your `.env` file to version control. Make sure it's included in your `.gitignore` file.

## Next Steps

After completing the installation process, proceed to the [basic configuration](./configuration.md) section to set up Svelte Guardian in your application.
