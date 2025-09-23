# UniFlow - Features Overview

## 🎯 Core Application Features

### ✅ Authentication & Security
- **Google OAuth Integration**: University email domain restriction (.edu, .ac.uk, .edu.au)
- **Row Level Security (RLS)**: Each user only sees their own data
- **Session Management**: Automatic redirect after login/logout
- **Email Validation**: Only university emails can access the application

### ✅ Progressive Web App (PWA)
- **Installable**: Can be installed on iOS, Android, and desktop
- **Offline Support**: Service worker for offline functionality
- **Responsive Design**: Mobile-first approach with hamburger menu
- **App Manifest**: Proper PWA configuration

### ✅ Theme System
- **Light/Dark Mode**: Toggle between pure white and pure black themes
- **Persistent Settings**: Theme preference saved in localStorage
- **System Preference**: Respects user's OS dark mode setting
- **Consistent Design**: Minimal black-and-white aesthetic throughout

## 📚 Academic Management

### ✅ Semester Management
- **CRUD Operations**: Create, read, update, delete semesters
- **Archive System**: Archive completed semesters instead of deleting
- **Course Organization**: View courses grouped by semester
- **Active/Archived Views**: Separate sections for better organization

### ✅ Course Management
- **Full CRUD**: Complete course lifecycle management
- **Detailed Information**: Professor name, room, credits tracking
- **Semester Association**: Courses linked to specific semesters
- **Visual Organization**: Card-based layout with clear information hierarchy

### ✅ Assignment Management
- **Status Tracking**: Red (not started) / Green (completed) status system
- **Due Date Management**: Calendar integration with due dates
- **Course Association**: Assignments linked to specific courses
- **Dashboard Integration**: Upcoming assignments prominently displayed

### ✅ Notes System
- **Rich Text Editor**: Full formatting capabilities for comprehensive notes
- **Chapter Organization**: Organize notes by course chapters
- **Tagging System**: Add tags for easy categorization and search
- **File Attachments**: Upload and attach files to notes
- **Search Functionality**: Find notes by content and tags

### ✅ File Management
- **Course Files**: Attach files to specific courses
- **Note Attachments**: Link files to individual notes
- **Upload System**: Drag-and-drop file upload interface
- **File Organization**: Organized by course and note associations

### ✅ Personal Events
- **Calendar Integration**: Personal events displayed alongside assignments
- **Event Types**: Distinction between assignments and personal events
- **Full CRUD**: Complete event management system

## 📊 Dashboard & Analytics

### ✅ Comprehensive Dashboard
- **Today's Tasks**: Assignments due today with time display
- **Upcoming Assignments**: Next 5 assignments with due dates
- **Recent Notes**: Latest 5 notes with course information
- **Quick Stats**: Active semesters, courses, assignments, and notes counts
- **Calendar Widget**: Month view integration
- **Quick Actions**: Fast access to create new items

### ✅ Calendar View
- **Monthly Display**: Full month calendar with all events
- **Event Categories**: Visual distinction between assignments and personal events
- **Navigation**: Month-to-month navigation
- **Event Details**: Click to view event information
- **Color Coding**: Red for assignments, blue for personal events

## 🔧 User Interface & Experience

### ✅ Navigation System
- **Collapsible Sidebar**: Desktop sidebar that collapses on mobile
- **Hamburger Menu**: Mobile-friendly navigation
- **Semester/Course Hierarchy**: Nested navigation showing structure
- **Quick Links**: Direct access to main features

### ✅ Layout & Design
- **Mobile-First**: Responsive design optimized for mobile devices
- **Card-Based Layout**: Clean card design for content organization
- **Consistent Typography**: Hierarchical text styling
- **Loading States**: Spinners and loading indicators
- **Empty States**: Helpful messages when no data exists

### ✅ Forms & Modals
- **Reusable Components**: Consistent form elements throughout
- **Validation**: Client-side form validation
- **Modal System**: Overlay modals for create/edit operations
- **Keyboard Navigation**: Escape key to close modals

## 📤 Export & Data Management

### ✅ Export Functionality
- **Notes to PDF**: Export all notes as PDF documents
- **Assignments to CSV/Excel**: Export assignment data for external use
- **Settings Integration**: Export options in settings page
- **Progress Indicators**: Loading states during export operations

### ✅ Settings & Preferences
- **Account Information**: Display user name and email
- **Theme Toggle**: Switch between light and dark modes
- **Export Options**: Access to all export functionality
- **App Information**: Version and feature information
- **Sign Out**: Secure logout functionality

## 🔄 Data Synchronization

### ✅ Real-Time Updates
- **Live Data**: Automatic data refresh after operations
- **Optimistic Updates**: Immediate UI updates for better UX
- **Error Handling**: Graceful error handling with user feedback
- **State Management**: Consistent state across components

### ✅ Offline Support
- **Service Worker**: Caches important resources for offline use
- **Background Sync**: Automatic sync when connection restored
- **Offline Indicators**: User feedback when offline
- **Progressive Enhancement**: Works without JavaScript

## 🏗️ Technical Architecture

### ✅ Modern Stack
- **Next.js 14**: Latest App Router with TypeScript
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Server state management (when installed)
- **React Hook Form**: Form handling with validation

### ✅ Database Design
- **Normalized Schema**: Proper relational database design
- **RLS Policies**: Row-level security for multi-tenant architecture
- **Indexes**: Performance optimization for common queries
- **Triggers**: Automatic user creation on signup
- **Constraints**: Data integrity enforcement

### ✅ Code Organization
- **Component Library**: Reusable UI components
- **Custom Hooks**: Shared logic extraction
- **Context Providers**: Global state management
- **Type Safety**: Full TypeScript integration
- **File Structure**: Logical organization following Next.js conventions

## 🚀 Performance & Optimization

### ✅ Loading & Performance
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component for performance
- **Bundle Optimization**: Webpack optimization for smaller bundles
- **Caching**: Proper HTTP caching headers
- **Lazy Loading**: On-demand loading of components

### ✅ SEO & Accessibility
- **Meta Tags**: Proper HTML meta information
- **Semantic HTML**: Accessible markup structure
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Focus Management**: Proper focus handling in modals

## 📱 Platform Support

### ✅ Cross-Platform Compatibility
- **iOS**: PWA installation and full functionality
- **Android**: Native-like experience with PWA
- **Desktop**: Full desktop browser support
- **Tablets**: Responsive design for tablet usage
- **All Modern Browsers**: Chrome, Firefox, Safari, Edge support

## 🎨 Design System

### ✅ Visual Consistency
- **Color Palette**: Black, white, and gray scale only
- **Typography**: Consistent font sizing and weights
- **Spacing**: Systematic spacing using Tailwind utilities
- **Border Radius**: Consistent rounded corners
- **Shadows**: Subtle elevation effects
- **Animations**: Smooth transitions and hover effects

This comprehensive PWA provides everything a university student needs to manage their academic life, from course organization to assignment tracking, with a modern, accessible, and performant interface.