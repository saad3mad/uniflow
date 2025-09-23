import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import { BookOpen, Plus, Search } from "lucide-react";

export default function CoursesPage() {
  const courses = [
    { name: "Computer Science 101", code: "CS101", progress: 72 },
    { name: "Linear Algebra", code: "MATH204", progress: 45 },
    { name: "Modern Physics", code: "PHYS210", progress: 58 },
    { name: "Intro to Psychology", code: "PSY100", progress: 83 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SectionHeader
        eyebrow={
          <span className="inline-flex items-center gap-2"><BookOpen className="w-4 h-4" /> Courses</span>
        }
        title="Manage your courses"
        subtitle="Organize all classes in one place. Track progress, see upcoming deadlines, and jump into resources fast."
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Search courses"
                className="pl-9 pr-3 py-2 rounded-lg bg-background-secondary border border-border text-sm focus-ring"
              />
            </div>
            <button className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> New Course</button>
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <Card key={c.code}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-xl text-text-primary">{c.name}</h3>
                <p className="text-text-secondary text-sm">{c.code}</p>
              </div>
              <span className="text-sm text-text-secondary">{c.progress}%</span>
            </div>
            <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
              <div className="h-full bg-accent-primary" style={{ width: `${c.progress}%` }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
