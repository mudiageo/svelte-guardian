---
title: "User Data and Profiles"
description: "Managing user data and profiles with Svelte Guardian."
---

# User Data and Profiles

Managing user data and profiles is an important aspect of any application with authentication. This guide covers how to work with user data in Svelte Guardian, including creating and updating user profiles.

## User Data Structure

Svelte Guardian stores core user data in the `User` table/collection with the following standard fields:

- `id`: Unique identifier
- `email`: User's email address
- `emailVerified`: Timestamp when email was verified
- `name`: User's display name (optional)
- `image`: URL to user's avatar image (optional)
- `password`: Hashed password (for credentials provider)
- `role`: User role for authorization

## Extending the User Model

### Using Prisma 

When using Prisma, extend the User model in `schema.prisma`:

```prisma
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
  
  // Custom fields
  firstName     String?
  lastName      String?
  birthDate     DateTime?
  phoneNumber   String?
  address       Address?
  preferences   Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Address {
  id        String @id @default(cuid())
  street    String
  city      String
  state     String?
  country   String
  zipCode   String
  userId    String @unique
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

After modifying your schema, run a migration:

```bash
npx prisma migrate dev --name add_user_profile_fields
```

### Using MongoDB

With MongoDB, the schema is more flexible:

```typescript
interface ExtendedUser {
  _id: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  role?: string;
  
  // Custom fields
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode: string;
  };
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Accessing User Data

### Server-Side Access

Access user data in server code:

```typescript
// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/database';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
    return { user: null };
  }
  
  // Fetch extended user data from database
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { address: true }
  });
  
  return {
    user: {
      ...session.user,
      ...userData,
      // Don't expose sensitive data
      password: undefined
    }
  };
};
```

### Client-Side Access

Use the data in client components:

```svelte
<!-- src/routes/profile/+page.svelte -->
<script>
  export let data;
  
  // Destructure user data
  $: ({ user } = data);
</script>

{#if user}
  <div class="profile-container">
    <h1>Your Profile</h1>
    
    <div class="profile-header">
      {#if user.image}
        <img src={user.image} alt="Profile" class="avatar" />
      {/if}
      <h2>{user.name || user.email}</h2>
      <span class="role-badge">{user.role}</span>
    </div>
    
    <div class="profile-details">
      <div class="detail-group">
        <h3>Personal Information</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>First Name:</strong> {user.firstName || 'Not set'}</p>
        <p><strong>Last Name:</strong> {user.lastName || 'Not set'}</p>
        <p><strong>Phone:</strong> {user.phoneNumber || 'Not set'}</p>
        <p><strong>Birth Date:</strong> {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Not set'}</p>
      </div>
      
      {#if user.address}
        <div class="detail-group">
          <h3>Address</h3>
          <p>{user.address.street}</p>
          <p>{user.address.city}, {user.address.state || ''} {user.address.zipCode}</p>
          <p>{user.address.country}</p>
        </div>
      {/if}
    </div>
    
    <div class="profile-actions">
      <a href="/profile/edit" class="button">Edit Profile</a>
      <a href="/profile/change-password" class="button">Change Password</a>
    </div>
  </div>
{:else}
  <p>Please sign in to view your profile.</p>
{/if}

<style>
  .profile-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
  }
  
  .role-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: #e8f5e9;
    color: #2e7d32;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .profile-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .detail-group {
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .detail-group h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  
  .profile-actions {
    display: flex;
    gap: 1rem;
  }
  
  .button {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #1565c0;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .profile-details {
      grid-template-columns: 1fr;
    }
  }
</style>
```

## Profile Editing

Create a profile editing form:

```svelte
<!-- src/routes/profile/edit/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  
  export let data;
  export let form;
  
  // Default form values from user data
  $: ({ user } = data);
  
  let formData = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    country: user?.address?.country || '',
    zipCode: user?.address?.zipCode || ''
  };
</script>

<div class="profile-edit-container">
  <h1>Edit Profile</h1>
  
  {#if form?.error}
    <div class="error">{form.error}</div>
  {/if}
  
  {#if form?.success}
    <div class="success">Profile updated successfully!</div>
  {/if}
  
  <form method="POST" use:enhance>
    <div class="form-grid">
      <div class="form-group">
        <label for="firstName">First Name</label>
        <input 
          type="text" 
          id="firstName" 
          name="firstName" 
          value={formData.firstName} 
        />
      </div>
      
      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input 
          type="text" 
          id="lastName" 
          name="lastName" 
          value={formData.lastName} 
        />
      </div>
      
      <div class="form-group">
        <label for="phoneNumber">Phone Number</label>
        <input 
          type="tel" 
          id="phoneNumber" 
          name="phoneNumber" 
          value={formData.phoneNumber} 
        />
      </div>
      
      <div class="form-group">
        <label for="birthDate">Birth Date</label>
        <input 
          type="date" 
          id="birthDate" 
          name="birthDate" 
          value={formData.birthDate} 
        />
      </div>
      
      <div class="form-group full-width">
        <label for="street">Street Address</label>
        <input 
          type="text" 
          id="street" 
          name="street" 
          value={formData.street} 
        />
      </div>
      
      <div class="form-group">
        <label for="city">City</label>
        <input 
          type="text" 
          id="city" 
          name="city" 
          value={formData.city} 
        />
      </div>
      
      <div class="form-group">
        <label for="state">State/Province</label>
        <input 
          type="text" 
          id="state" 
          name="state" 
          value={formData.state} 
        />
      </div>
      
      <div class="form-group">
        <label for="zipCode">ZIP/Postal Code</label>
        <input 
          type="text" 
          id="zipCode" 
          name="zipCode" 
          value={formData.zipCode} 
        />
      </div>
      
      <div class="form-group">
        <label for="country">Country</label>
        <input 
          type="text" 
          id="country" 
          name="country" 
          value={formData.country} 
        />
      </div>
    </div>
    
    <div class="form-actions">
      <a href="/profile" class="button secondary">Cancel</a>
      <button type="submit" class="button primary">Save Changes</button>
    </div>
  </form>
</div>

<style>
  .profile-edit-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  .full-width {
    grid-column: 1 / -1;
  }
  
  label {
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
  
  .button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    text-decoration: none;
    font-size: 1rem;
  }
  
  .primary {
    background-color: #1565c0;
    color: white;
  }
  
  .secondary {
    background-color: #e0e0e0;
    color: #333;
  }
  
  .error {
    background-color: #ffebee;
    color: #c62828;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .success {
    background-color: #e8f5e9;
    color: #2e7d32;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

And create the server action to handle profile updates:

```typescript
// src/routes/profile/edit/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/database';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
    redirect(302, '/signin');
  }
  
  // Fetch user data with address
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { address: true }
  });
  
  return { user };
};

export const actions = {
  default: async ({ request, locals }) => {
    const session = await locals.getSession();
    
    if (!session?.user) {
      return fail(401, { error: 'Unauthorized' });
    }
    
    const formData = await request.formData();
    const firstName = formData.get('firstName')?.toString() || '';
    const lastName = formData.get('lastName')?.toString() || '';
    const phoneNumber = formData.get('phoneNumber')?.toString() || '';
    const birthDate = formData.get('birthDate')?.toString() || '';
    
    const street = formData.get('street')?.toString() || '';
    const city = formData.get('city')?.toString() || '';
    const state = formData.get('state')?.toString() || '';
    const country = formData.get('country')?.toString() || '';
    const zipCode = formData.get('zipCode')?.toString() || '';
    
    try {
      // Update user data
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          firstName,
          lastName,
          phoneNumber,
          birthDate: birthDate ? new Date(birthDate) : null,
          name: `${firstName} ${lastName}`.trim() || undefined,
          
          // Upsert address - create if doesn't exist, update if it does
          address: {
            upsert: {
              create: {
                street,
                city,
                state,
                country,
                zipCode
              },
              update: {
                street,
                city,
                state,
                country,
                zipCode
              }
            }
          }
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return fail(500, { error: 'Failed to update profile' });
    }
  }
} satisfies Actions;
```

## Avatar/Profile Image Management

Add functionality for users to upload profile images:

```svelte
<!-- src/routes/profile/avatar/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  
  export let data;
  export let form;
  
  let previewUrl = data.user?.image || '';
  let fileInput;
  
  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      previewUrl = URL.createObjectURL(file);
    }
  }
</script>

<div class="avatar-container">
  <h1>Update Profile Picture</h1>
  
  {#if form?.error}
    <div class="error">{form.error}</div>
  {/if}
  
  {#if form?.success}
    <div class="success">Profile picture updated successfully!</div>
  {/if}
  
  <div class="avatar-preview">
    {#if previewUrl}
      <img src={previewUrl} alt="Profile Preview" />
    {:else}
      <div class="placeholder">No Image</div>
    {/if}
  </div>
  
  <form method="POST" use:enhance enctype="multipart/form-data">
    <div class="form-group">
      <label for="avatar">Select Image</label>
      <input 
        type="file" 
        id="avatar" 
        name="avatar" 
        accept="image/*" 
        on:change={handleFileChange}
        bind:this={fileInput}
      />
      <small>Max size: 2MB. Recommended: 500x500px square image.</small>
    </div>
    
    <div class="form-actions">
      <a href="/profile" class="button secondary">Cancel</a>
      <button type="submit" class="button primary">Upload Image</button>
    </div>
  </form>
</div>

<style>
  .avatar-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .avatar-preview {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    margin: 2rem auto;
    overflow: hidden;
    border: 3px solid #eee;
    background-color: #f5f5f5;
  }
  
  .avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 1.2rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  small {
    display: block;
    color: #666;
    margin-top: 0.5rem;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    text-decoration: none;
  }
  
  .primary {
    background-color: #1565c0;
    color: white;
  }
  
  .secondary {
    background-color: #e0e0e0;
    color: #333;
  }
  
  .error, .success {
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .error {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .success {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
</style>
```

Handle the image upload server-side:

```typescript
// src/routes/profile/avatar/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/database';
import { uploadImage } from '$lib/storage'; // Implement this based on your storage solution

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
    redirect(302, '/signin');
  }
  
  return {
    user: session.user
  };
};

export const actions = {
  default: async ({ request, locals }) => {
    const session = await locals.getSession();
    
    if (!session?.user) {
      return fail(401, { error: 'Unauthorized' });
    }
    
    const formData = await request.formData();
    const avatarFile = formData.get('avatar');
    
    if (!avatarFile || !(avatarFile instanceof File)) {
      return fail(400, { error: 'No valid file uploaded' });
    }
    
    if (avatarFile.size > 2 * 1024 * 1024) {
      return fail(400, { error: 'File size exceeds 2MB limit' });
    }
    
    try {
      // Upload image to storage (implement this based on your storage solution)
      const imageUrl = await uploadImage(
        avatarFile, 
        `users/${session.user.id}/avatar`, 
        { width: 500, height: 500 }
      );
      
      // Update user record with new image URL
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: imageUrl }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return fail(500, { error: 'Failed to upload image' });
    }
  }
} satisfies Actions;
```

## Changing Password

Create a password change form:

```svelte
<!-- src/routes/profile/change-password/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  
  export let form;
  
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let passwordVisible = false;
  
  function togglePasswordVisibility() {
    passwordVisible = !passwordVisible;
  }
  
  function validateForm() {
    return newPassword === confirmPassword;
  }
</script>

<div class="password-container">
  <h1>Change Password</h1>
  
  {#if form?.error}
    <div class="error">{form.error}</div>
  {/if}
  
  {#if form?.success}
    <div class="success">Password changed successfully!</div>
  {/if}
  
  <form 
    method="POST" 
    use:enhance 
    on:submit|preventDefault={(e) => {
      if (!validateForm()) {
        form = { error: 'New passwords do not match' };
        return;
      }
      e.target.submit();
    }}
  >
    <div class="form-group">
      <label for="currentPassword">Current Password</label>
      <div class="password-input">
        <input 
          type={passwordVisible ? 'text' : 'password'}
          id="currentPassword" 
          name="currentPassword" 
          bind:value={currentPassword}
          required
        />
      </div>
    </div>
    
    <div class="form-group">
      <label for="newPassword">New Password</label>
      <div class="password-input">
        <input 
          type={passwordVisible ? 'text' : 'password'}
          id="newPassword" 
          name="newPassword" 
          bind:value={newPassword}
          required
          minlength="8"
        />
      </div>
      <small>Password must be at least 8 characters long</small>
    </div>
    
    <div class="form-group">
      <label for="confirmPassword">Confirm New Password</label>
      <div class="password-input">
        <input 
          type={passwordVisible ? 'text' : 'password'}
          id="confirmPassword" 
          name="confirmPassword" 
          bind:value={confirmPassword}
          required
        />
      </div>
    </div>
    
    <div class="show-password">
      <label>
        <input type="checkbox" on:change={togglePasswordVisibility}>
        Show passwords
      </label>
    </div>
    
    <div class="form-actions">
      <a href="/profile" class="button secondary">Cancel</a>
      <button type="submit" class="button primary">Change Password</button>
    </div>
  </form>
</div>

<style>
  /* Similar styling as other forms */
  .password-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input[type="password"],
  input[type="text"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .password-input {
    position: relative;
  }
  
  small {
    display: block;
    color: #666;
    margin-top: 0.25rem;
  }
  
  .show-password {
    margin-bottom: 1.5rem;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    text-decoration: none;
  }
  
  .primary {
    background-color: #1565c0;
    color: white;
  }
  
  .secondary {
    background-color: #e0e0e0;
    color: #333;
  }
  
  .error, .success {
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .error {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .success {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
</style>
```

And the server handler:

```typescript
// src/routes/profile/change-password/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { changePassword } from '$lib/auth';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
    redirect(302, '/signin');
  }
  
  return {};
};

export const actions = {
  default: async ({ request, locals }) => {
    const session = await locals.getSession();
    
    if (!session?.user) {
      return fail(401, { error: 'Unauthorized' });
    }
    
    const formData = await request.formData();
    const currentPassword = formData.get('currentPassword')?.toString() || '';
    const newPassword = formData.get('newPassword')?.toString() || '';
    const confirmPassword = formData.get('confirmPassword')?.toString() || '';
    
    if (newPassword !== confirmPassword) {
      return fail(400, { error: 'New passwords do not match' });
    }
    
    if (newPassword.length < 8) {
      return fail(400, { error: 'New password must be at least 8 characters long' });
    }
    
    try {
      // Use the Svelte Guardian utility to change password
      await changePassword({
        userId: session.user.id,
        currentPassword,
        newPassword
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error.code === 'INVALID_PASSWORD') {
        return fail(400, { error: 'Current password is incorrect' });
      }
      
      return fail(500, { error: 'Failed to change password' });
    }
  }
} satisfies Actions;
```

## Best Practices

1. **Data Validation**: Always validate user input on both client and server
2. **Security**: Never expose sensitive information like hashed passwords
3. **Incremental Loading**: For complex profiles, load data incrementally
4. **Atomic Updates**: Update specific parts of the profile independently
5. **Error Handling**: Provide clear feedback when updates fail
6. **Data Privacy**: Allow users to download or delete their data
7. **Image Optimization**: Resize and compress profile images
8. **Performance**: Use database indexes for efficient user lookup

## Next Steps

After implementing user profiles, consider these enhancements:

- [Account linking with OAuth providers](../guides/oauth-providers.md)
- [Privacy settings and data export](../guides/user-data-export.md)
- [Adding custom fields based on user roles](../guides/role-based-authorization.md)
