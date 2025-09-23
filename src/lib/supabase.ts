// Database types placeholder - ready for new database provider integration
export type Database = {
  // Define your database schema types here when integrating a new provider
}

// Placeholder types for application data models
export type User = {
  user_id: string
  name: string
  email: string
  created_at: string
  last_login: string
}

export type Semester = {
  semester_id: string
  user_id: string
  name: string
  archived: boolean
  created_at: string
}

export type Course = {
  course_id: string
  semester_id: string
  name: string
  professor_name: string
  room: string
  credits: number
  created_at: string
}

export type Assignment = {
  assignment_id: string
  course_id: string
  title: string
  description: string
  due_date: string
  status: 'not_started' | 'completed'
  created_at: string
}

export type Note = {
  note_id: string
  course_id: string
  chapter: string
  content: string
  tags: string[]
  created_at: string
}

export type FileRecord = {
  file_id: string
  course_id: string | null
  note_id: string | null
  file_url: string
  uploaded_at: string
}

export type Event = {
  event_id: string
  user_id: string
  title: string
  description: string
  date: string
  type: 'assignment' | 'personal'
  created_at: string
}

// Placeholder for database client - replace when integrating new provider
export const createClient = () => {
  throw new Error('Database client not configured. Please integrate a database provider.')
}

// Placeholder for direct database connection
export const supabase = {
  // Add your database client methods here when integrating a new provider
}