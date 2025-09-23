# Google OAuth Setup Guide for UniFlow

## 🔧 Current Issue

You're getting an "Unable to exchange external code" error, which means the Google OAuth configuration needs to be set up properly in both Google Cloud Console and Supabase.

## 📋 Step-by-Step Fix

### 1. Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select Project**: 
   - If new: Click "New Project" and create one for UniFlow
   - If existing: Select your project from the dropdown

3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" 
   - Click and press "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "UniFlow"

5. **Configure Redirect URIs**:
   Add these exact URIs in "Authorized redirect URIs":
   ```
   https://ylyvflqvjwiyfuqeeqnj.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

6. **Copy Credentials**:
   - Copy the "Client ID" 
   - Copy the "Client Secret"

### 2. Supabase Configuration

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select Your Project**: ylyvflqvjwiyfuqeeqnj
3. **Navigate to Authentication**:
   - Go to "Authentication" > "Providers"
   - Find "Google" and toggle it ON

4. **Configure Google Provider**:
   - Paste your **Client ID** from Google Cloud Console
   - Paste your **Client Secret** from Google Cloud Console
   - Click "Save"

### 3. Test the Setup

1. **Clear Browser Cache**: Clear cookies and cache for localhost:3000
2. **Restart Development Server**: 
   ```bash
   npm run dev
   ```
3. **Try Login Again**: Click the Google sign-in button

## 🐛 Troubleshooting

### If you still get errors:

**Check Redirect URI Mismatch**:
- Ensure the redirect URI in Google Cloud Console exactly matches:
  `https://ylyvflqvjwiyfuqeeqnj.supabase.co/auth/v1/callback`

**Check Domain Restrictions**:
- I've temporarily removed the `.edu` domain restriction
- Once login works, we can add it back

**Check Supabase Settings**:
- In Supabase Dashboard > Authentication > Settings
- Ensure "Enable email confirmations" is OFF for testing
- Site URL should be: `http://localhost:3000`

### Common Issues:

1. **"redirect_uri_mismatch"**: 
   - Double-check the redirect URI in Google Cloud Console
   - It must exactly match the Supabase callback URL

2. **"invalid_client"**:
   - Check that Client ID and Secret are correctly pasted in Supabase
   - No extra spaces or characters

3. **"unauthorized_client"**:
   - Ensure Google+ API is enabled in Google Cloud Console
   - Check that OAuth consent screen is configured

## 📞 Support

If you continue having issues:
1. Check the browser console for detailed error messages
2. Look at the Supabase authentication logs
3. Verify all URLs and credentials are exactly correct

The error display has been added to the login page, so you'll see more detailed error messages now.