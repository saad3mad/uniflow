## UniFlow - Student Management System

A Progressive Web App for university students to manage semesters, courses, assignments, notes, and events.

### Features
- Google authentication with university email domain restriction
- CRUD operations for semesters, courses, assignments, and notes
- Rich text notes with file uploads and tagging
- Calendar view for assignments and personal events
- Export functionality for notes (PDF) and assignments (CSV/Excel)
- Light/dark theme toggle
- PWA capabilities for offline use
- Mobile-first responsive design

### Tech Stack
- Next.js 14 with TypeScript
- Supabase for backend and authentication
- Tailwind CSS for styling
- React Query for state management
- React Hook Form for form handling

### Getting Started

1. Install Node.js and npm
2. Clone the repository
3. Install dependencies: `npm install`
4. Set up Supabase environment variables
5. Run the development server: `npm run dev`

### Environment Variables
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```