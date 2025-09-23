'use client'

import { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  CheckSquare, 
  BarChart3,
  Moon,
  Sun,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Target,
  Clock
} from 'lucide-react'

export default function HomePage() {
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Course Management',
      description: 'Organize all your courses, track progress, and manage syllabi in one centralized hub.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CheckSquare,
      title: 'Assignment Tracker',
      description: 'Never miss a deadline again. Track assignments, set reminders, and monitor completion status.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileText,
      title: 'Smart Notes',
      description: 'Take, organize, and search through your notes with powerful tagging and categorization.',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Calendar,
      title: 'Academic Calendar',
      description: 'Visualize your academic schedule with integrated calendar and timeline views.',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Active Students' },
    { number: '500+', label: 'Universities' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'Support' }
  ]

  const chipVariants = ['chip-blue', 'chip-cyan', 'chip-violet']

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Floating elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Blob A */}
              <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-accent-primary/20 to-accent-warm/20 dark:from-accent-primary/25 dark:to-accent-warm/25 rounded-full blur-2xl animate-float"></div>

              {/* Blob B (reverse motion) */}
              <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-[#6e10e0]/20 to-[#136aed]/20 dark:from-[#6e10e0]/25 dark:to-[#136aed]/25 rounded-full blur-2xl animate-float-rev" style={{ animationDelay: '1.5s' }}></div>

              {/* Blob C (slow) */}
              <div className="absolute bottom-24 left-1/4 w-28 h-28 bg-gradient-to-br from-[#0fbed9]/20 to-[#34d399]/20 dark:from-[#0fbed9]/25 dark:to-[#34d399]/25 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '3s' }}></div>

              {/* Blob D (new, small accent) */}
              <div className="absolute top-10 right-1/3 w-16 h-16 bg-gradient-to-br from-[#136aed]/20 to-[#0fbed9]/20 dark:from-[#136aed]/25 dark:to-[#0fbed9]/25 rounded-full blur-xl animate-float" style={{ animationDelay: '2.5s' }}></div>

              {/* Blob E (new, wide) */}
              <div className="absolute bottom-8 right-10 w-48 h-24 bg-gradient-to-br from-[#edbd1f]/15 to-[#6e10e0]/15 dark:from-[#edbd1f]/20 dark:to-[#6e10e0]/20 rounded-full blur-3xl animate-float-rev" style={{ animationDelay: '4.5s' }}></div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-accent-subtle text-accent-secondary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>The future of academic management</span>
            </div>

            {/* Main headline */}
            <h1 className="hero-title mb-6 animate-slide-up">
              Transform your
              <span className="gradient-text block">academic journey</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Manage courses, assignments, notes, and schedules — fast. Built for students who want a bold, minimal, and modern workspace.
            </p>

            {/* Pill search/CTA */}
            <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="pill-group surface-gloss">
                <div className="pill-addon hidden sm:block">🔎</div>
                <input className="pill-input" placeholder="Find a course, note, or assignment" />
                <button className="pill-cta">Search</button>
              </div>
            </div>

            {/* Capabilities */}
            <div className="flex items-center justify-center gap-4 mt-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <span className="text-sm text-text-tertiary">Organize</span>
              <span className="text-text-tertiary">•</span>
              <span className="text-sm text-text-tertiary">Track</span>
              <span className="text-text-tertiary">•</span>
              <span className="text-sm text-text-tertiary">Plan</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <button className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group">
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn-secondary text-lg px-8 py-4">Watch Demo</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">{stat.number}</div>
                  <div className="text-text-secondary">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl sm:text-5xl text-text-primary mb-6">
              <span className="block">Everything you need to</span>
              <span className="gradient-text block">excel academically</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Powerful features designed to help students organize, track, and succeed in their academic pursuits.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-interactive group">
                <div className={`w-12 h-12 ${chipVariants[index % chipVariants.length]} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-text-primary mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center rounded-2xl p-6 md:p-8">
            <div>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl text-text-primary mb-6">
                Why students choose
                <span className="font-brand gradient-text block">uniflow</span>
              </h2>
              <p className="text-xl text-text-secondary mb-8">
                Join thousands of students who have transformed their academic experience with our comprehensive platform.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 chip-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Boost Productivity</h3>
                    <p className="text-text-secondary">Streamline your workflow and focus on what matters most - your education.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 chip-cyan rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Save Time</h3>
                    <p className="text-text-secondary">Automated reminders and smart organization save hours every week.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 chip-violet rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Track Progress</h3>
                    <p className="text-text-secondary">Visual analytics help you understand your academic performance trends.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="brand-gradient rounded-3xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Today's Schedule</h3>
                    <Calendar className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/15 dark:bg-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Computer Science 101</span>
                        <span className="text-sm">9:00 AM</span>
                      </div>
                      <p className="text-sm opacity-90">Data Structures & Algorithms</p>
                    </div>
                    
                    <div className="bg-white/15 dark:bg-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Mathematics</span>
                        <span className="text-sm">2:00 PM</span>
                      </div>
                      <p className="text-sm opacity-90">Linear Algebra Assignment Due</p>
                    </div>
                    
                    <div className="bg-white/15 dark:bg-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Study Group</span>
                        <span className="text-sm">7:00 PM</span>
                      </div>
                      <p className="text-sm opacity-90">Physics Review Session</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-text-primary mb-6">
            Ready to transform your
            <span className="gradient-text block">academic experience?</span>
          </h2>
          <p className="text-xl text-text-secondary mb-10">
            Join thousands of students who are already using UNIFLOW to achieve academic excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-secondary text-lg px-8 py-4">Schedule Demo</button>
          </div>
        </div>
      </section>
      {/* Footer is provided by global layout */}
    </div>
  )
}
