'use client'

import { useQuery } from '@tanstack/react-query'

// Placeholder dashboard data interface
interface DashboardData {
  semesters: Array<{
    semester_id: string
    name: string
    courses: Array<{
      course_id: string
      name: string
    }>
  }>
  upcomingAssignments: Array<{
    assignment_id: string
    title: string
    due_date: string
    status: 'not_started' | 'completed'
    course: {
      name: string
      course_id: string
    }
  }>
  todayTasks: Array<{
    assignment_id: string
    title: string
    due_date: string
    status: 'not_started' | 'completed'
    course: {
      name: string
      course_id: string
    }
  }>
  recentNotes: Array<{
    note_id: string
    chapter: string
    content: string
    created_at: string
    course: {
      name: string
      course_id: string
    }
  }>
  recentCourses: Array<{
    course_id: string
    name: string
    code: string
    semester: string
    lastAccessed: string
    professor_name: string
    room: string
    credits: number
  }>
}

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      throw new Error('Database provider not configured')
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}