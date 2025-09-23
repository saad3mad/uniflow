import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import { CheckSquare, AlertTriangle, Plus, Filter, CalendarDays } from "lucide-react";

export default function AssignmentsPage() {
  const dueSoon = [
    { title: "Lab Report: Kinematics", course: "PHYS210", due: "Today 6:00 PM", priority: "High" },
    { title: "Problem Set 4", course: "MATH204", due: "Tomorrow", priority: "Medium" },
  ];

  const overdue = [
    { title: "Reading Quiz 2", course: "PSY100", due: "Yesterday", priority: "Low" },
  ];

  const completed = [
    { title: "Homework 3", course: "CS101", due: "Sep 10", priority: "—" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SectionHeader
        eyebrow={<span className="inline-flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Assignments</span>}
        title="Stay ahead of every deadline"
        subtitle="Fast filtering, clear priorities, and a simple overview keep you on track."
        actions={
          <div className="flex items-center gap-3">
            <button className="btn-secondary inline-flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</button>
            <button className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> New Assignment</button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-xl text-text-primary">Due Soon</h3>
            <CalendarDays className="w-4 h-4 text-text-secondary" />
          </div>
          <div className="space-y-4">
            {dueSoon.map((a, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-text-primary">{a.title}</div>
                  <div className="text-sm text-text-secondary">{a.course} • {a.due}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-border text-text-secondary">{a.priority}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-xl text-text-primary">Overdue</h3>
            <AlertTriangle className="w-4 h-4 text-text-secondary" />
          </div>
          <div className="space-y-4">
            {overdue.map((a, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-text-primary">{a.title}</div>
                  <div className="text-sm text-text-secondary">{a.course} • {a.due}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-border text-text-secondary">{a.priority}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-xl text-text-primary">Completed</h3>
            <CheckSquare className="w-4 h-4 text-text-secondary" />
          </div>
          <div className="space-y-4">
            {completed.map((a, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-text-primary">{a.title}</div>
                  <div className="text-sm text-text-secondary">{a.course} • {a.due}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-border text-text-secondary">{a.priority}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
