'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Semester, Course, Assignment, Note, Event } from '../lib/supabase'

// Placeholder database hooks - ready for new database provider integration
// These hooks maintain the same interface but throw errors until a database provider is configured

// Semester Hooks
export function useSemesters() {
  return useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      throw new Error('Database provider not configured')
    },
  })
}

export function useCreateSemester() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (semester: { name: string }) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] })
    },
  })
}

export function useUpdateSemester() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Semester> }) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useDeleteSemester() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

// Course Hooks
export function useCourses(semesterId?: string) {
  return useQuery({
    queryKey: ['courses', semesterId],
    queryFn: async () => {
      throw new Error('Database provider not configured')
    },
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (course: {
      semester_id: string
      name: string
      professor_name: string
      room: string
      credits: number
    }) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Course> }) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// Assignment Hooks
export function useAssignments(courseId?: string) {
  return useQuery({
    queryKey: ['assignments', courseId],
    queryFn: async () => {
      throw new Error('Database provider not configured')
    },
  })
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (assignment: {
      course_id: string
      title: string
      description: string
      due_date: string
    }) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Assignment> }) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// Note Hooks
export function useNotes(courseId?: string) {
  return useQuery({
    queryKey: ['notes', courseId],
    queryFn: async () => {
      throw new Error('Database provider not configured')
    },
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (note: {
      course_id: string
      chapter: string
      content: string
      tags?: string[]
    }) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// Event Hooks
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      throw new Error('Database provider not configured')
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (event: {
      title: string
      description: string
      date: string
      type: 'assignment' | 'personal'
    }) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Event> }) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      throw new Error('Database provider not configured')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}