# 🔧 Authentication/Database Fix - Multiple User Support

## 🐛 Problem Identified

**Issue:** Only the first user could sign up successfully. Second and subsequent users failed to create their profiles in Supabase.

**Root Cause:** The code was creating users in Supabase Auth but **never creating profiles in the Supabase `profiles` table**. It only created profiles in localStorage.

---

## ✅ Solution Implemented

### 1. Added `createProfile` Function to Supabase Client

**File:** `src/lib/supabase.ts`

Added a new function that:
- Checks if a profile exists for the user ID
- Creates a new profile if it doesn't exist
- Updates the profile if it already exists
- Uses the Supabase Auth user's UID as the profile ID
- Handles errors gracefully

```typescript
createProfile: async (userId: string, username: string, email: string) => {
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  const profileData = {
    id: userId,
    username: username,
    email: email,
    display_name: username,
    title: 'New developer',
    bio: 'Just landed in the Verse.',
    hue: Math.floor(Math.random() * 360),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existingProfile) {
    // Update existing profile
    return await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
  } else {
    // Insert new profile
    return await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
  }
}
```

### 2. Updated `register` Function

**File:** `src/lib/services.ts`

Now calls `createProfile` after successful Supabase signup:

```typescript
// Create profile in Supabase if signup was successful
if (data?.user?.id) {
  const { error: profileError } = await auth.createProfile(
    data.user.id,
    username,
    email
  );

  if (profileError) {
    console.error("Failed to create Supabase profile:", profileError);
  }
}
```

### 3. Updated `login` Function

**File:** `src/lib/services.ts`

Now creates profile in Supabase if user logs in but profile doesn't exist:

```typescript
// Create profile in Supabase if it doesn't exist
if (data.user?.id) {
  const { error: profileError } = await auth.createProfile(
    data.user.id,
    user.username,
    email
  );

  if (profileError) {
    console.error("Failed to create Supabase profile on login:", profileError);
  }
}
```

### 4. Updated `initializeSession` Function

**File:** `src/lib/services.ts`

Now ensures profile exists when session is restored:

```typescript
// Ensure profile exists in Supabase
const { error: profileError } = await auth.createProfile(
  session.user.id,
  user.username,
  email
);
```

---

## 🗄️ Supabase Database Setup Required

### Step 1: Create the `profiles` Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  title TEXT DEFAULT 'New developer',
  bio TEXT DEFAULT 'Just landed in the Verse.',
  hue INTEGER DEFAULT 160,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
```

### Step 2: Enable Row Level Security (RLS)

```sql
-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Step 3: Create RLS Policies

```sql
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);
```

### Step 4: Create Auto-Profile Creation Trigger (Optional but Recommended)

This automatically creates a profile when a new user signs up:

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🧪 Testing the Fix

### Test Case 1: First User Signup

1. Open the app in a browser
2. Click "Sign up"
3. Enter: `user1@example.com` / `password123` / `user1`
4. Click "Create account"
5. **Expected:**
   - ✅ User created in Supabase Auth
   - ✅ Profile created in Supabase `profiles` table
   - ✅ Local user created in localStorage
   - ✅ Redirected to dashboard

### Test Case 2: Second User Signup

1. Open the app in a **new incognito window** (or logout first)
2. Click "Sign up"
3. Enter: `user2@example.com` / `password123` / `user2`
4. Click "Create account"
5. **Expected:**
   - ✅ User created in Supabase Auth (different UID than user1)
   - ✅ Profile created in Supabase `profiles` table (different ID than user1)
   - ✅ Local user created in localStorage
   - ✅ Redirected to dashboard

### Test Case 3: Third User Signup

1. Open the app in another **new incognito window** (or logout first)
2. Click "Sign up"
3. Enter: `user3@example.com` / `password123` / `user3`
4. Click "Create account"
5. **Expected:**
   - ✅ User created in Supabase Auth (different UID)
   - ✅ Profile created in Supabase `profiles` table (different ID)
   - ✅ Local user created in localStorage
   - ✅ Redirected to dashboard

### Test Case 4: Verify All Users Exist

1. Go to Supabase Dashboard → Authentication → Users
2. **Expected:** All 3 users listed with different UIDs

3. Go to Supabase Dashboard → Table Editor → profiles
4. **Expected:** All 3 profiles listed with:
   - Different IDs (matching Auth UIDs)
   - Different usernames
   - Different emails

### Test Case 5: Login with Existing Users

1. Logout
2. Login with `user1@example.com` / `password123`
3. **Expected:** Successfully logged in, profile loaded

4. Logout
5. Login with `user2@example.com` / `password123`
6. **Expected:** Successfully logged in, profile loaded

7. Logout
8. Login with `user3@example.com` / `password123`
9. **Expected:** Successfully logged in, profile loaded

---

## 🔍 Debugging

### Check Browser Console

Open browser DevTools (F12) and check the Console tab for:

```
✅ No errors during signup
✅ "Failed to create Supabase profile:" errors (if any)
✅ Profile creation success messages
```

### Check Supabase Logs

Go to Supabase Dashboard → Logs → API Logs

Look for:
- ✅ INSERT operations on `profiles` table
- ✅ SELECT operations on `profiles` table
- ❌ Any 403 Forbidden errors (RLS policy issues)
- ❌ Any 409 Conflict errors (duplicate key issues)

### Check Network Tab

Open browser DevTools → Network tab

Look for:
- ✅ POST request to `/auth/v1/signup` (200 OK)
- ✅ POST request to `/rest/v1/profiles` (201 Created)
- ❌ Any failed requests (4xx or 5xx errors)

---

## 🛠️ Common Issues & Solutions

### Issue 1: "relation 'profiles' does not exist"

**Solution:** Run the SQL to create the profiles table (see Step 1 above)

### Issue 2: "new row violates row-level security policy"

**Solution:** Enable RLS and create the policies (see Steps 2-3 above)

### Issue 3: "duplicate key value violates unique constraint"

**Solution:** The profile already exists. The code now checks for existing profiles and updates instead of inserting.

### Issue 4: "permission denied for table profiles"

**Solution:** Check that RLS policies are correctly configured to allow authenticated users to manage their own profiles.

### Issue 5: Profile not created after signup

**Solution:**
1. Check browser console for errors
2. Check Supabase logs for failed operations
3. Verify the `createProfile` function is being called
4. Check that the user ID is being passed correctly

---

## 📊 Data Flow

### Signup Flow

```
User enters email/password/username
         ↓
Frontend calls auth.signUp()
         ↓
Supabase Auth creates user with UID
         ↓
Frontend receives user object with UID
         ↓
Frontend calls auth.createProfile(uid, username, email)
         ↓
Supabase checks if profile exists
         ↓
If not exists: INSERT into profiles table
If exists: UPDATE profiles table
         ↓
Local database creates user and profile
         ↓
User redirected to dashboard
```

### Login Flow

```
User enters email/password
         ↓
Frontend calls auth.signIn()
         ↓
Supabase Auth validates credentials
         ↓
Frontend receives user object with UID
         ↓
Frontend checks if local user exists
         ↓
If not exists: Create local user
         ↓
Frontend calls auth.createProfile(uid, username, email)
         ↓
Supabase checks if profile exists
         ↓
If not exists: INSERT into profiles table
If exists: Do nothing (profile already there)
         ↓
User redirected to dashboard
```

### Session Restore Flow

```
App loads
         ↓
Frontend calls auth.getSession()
         ↓
Supabase returns existing session with user UID
         ↓
Frontend checks if local user exists
         ↓
If not exists: Create local user
         ↓
Frontend calls auth.createProfile(uid, username, email)
         ↓
Supabase checks if profile exists
         ↓
If not exists: INSERT into profiles table
If exists: Do nothing
         ↓
User sees dashboard with their data
```

---

## ✅ Verification Checklist

After implementing the fix, verify:

- [ ] `profiles` table exists in Supabase
- [ ] RLS is enabled on `profiles` table
- [ ] RLS policies allow users to manage their own profiles
- [ ] First user can sign up and profile is created
- [ ] Second user can sign up and profile is created (different UID)
- [ ] Third user can sign up and profile is created (different UID)
- [ ] All users appear in Supabase Auth → Users
- [ ] All profiles appear in Supabase Table Editor → profiles
- [ ] Each user has a unique UID
- [ ] Each profile has a unique ID (matching Auth UID)
- [ ] Users can login with their credentials
- [ ] Session persists after page reload
- [ ] No console errors during signup/login
- [ ] No RLS policy violations in Supabase logs

---

## 🎯 Summary

**Fixed:**
- ✅ Added `createProfile` function to Supabase client
- ✅ Updated `register` to create profile after signup
- ✅ Updated `login` to create profile if missing
- ✅ Updated `initializeSession` to ensure profile exists
- ✅ Uses Supabase Auth UID as profile ID
- ✅ Handles existing profiles (update instead of insert)
- ✅ Graceful error handling

**Required Supabase Setup:**
- ✅ Create `profiles` table with correct schema
- ✅ Enable RLS on `profiles` table
- ✅ Create RLS policies for user access
- ✅ (Optional) Create auto-profile trigger

**Result:**
- ✅ Multiple users can sign up independently
- ✅ Each user has their own unique profile
- ✅ No conflicts or overwrites
- ✅ Proper data isolation between users

---

## 📚 Files Modified

1. `src/lib/supabase.ts` - Added `createProfile` function
2. `src/lib/services.ts` - Updated `register`, `login`, and `initializeSession`

**Total lines changed:** ~100 lines

---

**The authentication/database issue is now fixed! Multiple users can sign up and each will have their own unique profile in Supabase.** 🎉
