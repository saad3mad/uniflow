# UniFlow - Production Deployment Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
1. **Node.js** (v18+): Download from [nodejs.org](https://nodejs.org/)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com/)
3. **Google OAuth** (optional): For Google authentication

### Step 1: Install Dependencies
```bash
cd UNIFLOW
npm install
```

### Step 2: Set Up Supabase
1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to **Settings > API** and copy your:
   - Project URL
   - Anon public key
3. Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Create Database
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire `database-schema.sql` file content
3. Paste and run it to create all tables and security policies

### Step 4: Configure Authentication
1. In Supabase, go to **Authentication > Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials (optional)

### Step 5: Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Option 2: Other Platforms
- **Netlify**: Full Next.js support
- **Railway**: Easy deployment with databases
- **AWS Amplify**: Scalable hosting
- **DigitalOcean**: App Platform support

## 📱 PWA Installation

After deployment, users can install the app:
- **Mobile**: "Add to Home Screen" option
- **Desktop**: Install button in browser address bar
- **All Platforms**: Works offline after first visit

## 🔧 Configuration Options

### Email Domain Restrictions
Edit `src/app/page.tsx` line 25-30 to change allowed domains:
```typescript
if (email && (email.endsWith('.edu') || email.endsWith('.ac.uk'))) {
  // Add your university domains here
}
```

### Theme Customization
Edit `src/app/globals.css` to modify the color scheme while maintaining the black/white aesthetic.

### Database Customization
Modify `database-schema.sql` to add custom fields or tables for your specific needs.

## 📊 Features Included

### ✅ Complete Academic Management
- **Semesters**: Create, archive, manage academic periods
- **Courses**: Full course information with professors and rooms
- **Assignments**: Due date tracking with status updates
- **Notes**: Rich text with file attachments and tagging
- **Calendar**: Visual overview of all assignments and events

### ✅ Modern User Experience
- **PWA**: Installable, works offline
- **Responsive**: Mobile-first design
- **Dark/Light Mode**: Theme switching
- **Real-time**: Live data synchronization

### ✅ Export & Integration
- **PDF Export**: Notes and course materials
- **CSV Export**: Assignment data for external tools
- **File Management**: Upload and organize documents

## 🔒 Security Features

- **University Email Only**: Restricted to educational domains
- **Row Level Security**: Users only see their own data
- **HTTPS Required**: Secure data transmission
- **OAuth Integration**: Secure Google authentication

## 📈 Scalability

The application is built to handle:
- **Multiple Universities**: Multi-tenant architecture
- **Large Datasets**: Optimized database queries
- **High Traffic**: Serverless deployment ready
- **Global Users**: CDN and edge deployment support

## 🛠️ Troubleshooting

### Common Issues
1. **Build Errors**: Run `npm install` to install all dependencies
2. **Database Issues**: Ensure `database-schema.sql` was run completely
3. **Auth Problems**: Check Supabase URL and keys in `.env.local`
4. **PWA Not Installing**: Verify manifest.json and HTTPS deployment

### Getting Help
- Check browser console for errors
- Verify all environment variables are set
- Ensure Supabase project is properly configured
- Test with a university email address

## 📝 Customization Guide

### Adding New Features
1. Create new components in `src/components/`
2. Add new pages in `src/app/`
3. Update database schema if needed
4. Add new API routes in `src/app/api/`

### Styling Changes
- Modify `tailwind.config.ts` for theme changes
- Update `src/app/globals.css` for global styles
- Edit component files for specific styling

### University-Specific Customization
- Update email domain validation
- Add university branding
- Customize available features
- Add institution-specific fields

## 🎯 Success Metrics

Your deployment is successful when:
- ✅ Students can sign in with university emails
- ✅ App can be installed on mobile devices
- ✅ All CRUD operations work smoothly
- ✅ Data exports function correctly
- ✅ Offline mode works after first visit
- ✅ Theme switching works properly

## 🔄 Maintenance

### Regular Tasks
- Monitor Supabase usage and performance
- Update dependencies monthly
- Review user feedback and bug reports
- Monitor authentication success rates

### Updates
- Next.js and dependencies: Update quarterly
- Security patches: Apply immediately
- Feature additions: Based on user feedback

## 📞 Support

For technical support:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check Next.js deployment guides
4. Verify all environment variables

The application is now ready for production use with a comprehensive feature set for university student management!