# UniFlow - Setup Instructions

## Prerequisites

1. **Node.js and npm**: Install Node.js (v18 or later) from [nodejs.org](https://nodejs.org/)
2. **Database Provider**: Choose your preferred database solution
3. **Authentication Provider**: Choose your preferred authentication solution

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Choose and Configure Database Provider

The application is ready for integration with any database provider. Choose from:

- **Firebase/Firestore**
- **MongoDB**
- **PostgreSQL**
- **MySQL**
- **Supabase**
- **PlanetScale**
- **Any other database solution**

### 3. Choose and Configure Authentication Provider

The application supports integration with any authentication provider:

- **Firebase Auth**
- **Auth0**
- **NextAuth.js**
- **AWS Cognito**
- **Supabase Auth**
- **Custom authentication**

### 4. Environment Configuration

1. Create a `.env.local` file in the root directory
2. Add your database and authentication provider credentials:

```env
# Database Configuration
DATABASE_URL=your-database-connection-string

# Authentication Configuration
AUTH_PROVIDER_CLIENT_ID=your-client-id
AUTH_PROVIDER_CLIENT_SECRET=your-client-secret
AUTH_REDIRECT_URL=http://localhost:3000/auth/callback

# Add other provider-specific variables as needed
```

### 5. Update Configuration Files

Update the following files for your chosen providers:

1. **`src/lib/supabase.ts`** - Replace with your database client
2. **`src/hooks/useAuth.ts`** - Implement authentication logic
3. **`src/hooks/useDatabase.ts`** - Implement database operations
4. **`src/middleware.ts`** - Configure authentication middleware
5. **API routes in `src/app/api/`** - Connect to your backend

## Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Features Implemented

### ✅ Core Features
- **Authentication**: Google login with university email restriction
- **Progressive Web App**: Installable, offline support
- **Responsive Design**: Mobile-first, works on all devices
- **Light/Dark Theme**: Toggle between themes

### ✅ Data Management
- **Semesters**: Create, edit, archive, delete
- **Courses**: Full CRUD operations
- **Assignments**: Status tracking (not started/completed)
- **Notes**: Rich text editor with tagging
- **Files**: Upload and attach to courses/notes
- **Events**: Personal calendar events

### ✅ User Interface
- **Dashboard**: Overview of upcoming assignments and tasks
- **Calendar View**: Monthly view of all assignments and events
- **Sidebar Navigation**: Collapsible on mobile
- **Settings Page**: Account info, theme toggle, export options

### ✅ Advanced Features
- **Export**: Notes to PDF, assignments to CSV/Excel
- **Search**: Find notes by content and tags
- **Offline Support**: PWA with service worker
- **Real-time Sync**: Automatic data synchronization

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── calendar/          # Calendar view
│   ├── semesters/         # Semester management
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing/login page
├── components/            # React components
│   ├── Layout/            # Layout components
│   └── UI/                # Reusable UI components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
└── lib/                   # Utilities and configs
```

## Database Schema

The application uses the following main tables:
- `users` - User accounts
- `semesters` - Academic semesters
- `courses` - Courses within semesters
- `assignments` - Course assignments
- `notes` - Course notes with rich text
- `files` - File attachments
- `events` - Personal calendar events

All tables have Row Level Security (RLS) enabled to ensure users only access their own data.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## Troubleshooting

### Common Issues

1. **Authentication not working**: Check Supabase URL and keys in `.env.local`
2. **Database errors**: Ensure all tables are created using `database-schema.sql`
3. **Google OAuth issues**: Verify redirect URLs in Google Console and Supabase
4. **PWA not installing**: Check manifest.json and service worker registration

### Getting Help

- Check Supabase documentation for authentication and database issues
- Verify all environment variables are set correctly
- Ensure university email domains are configured in the authentication logic

## License

This project is open source and available under the MIT License.