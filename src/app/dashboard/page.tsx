import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import { CalendarDays, Clock } from "lucide-react";

export default function DashboardPage() {
  const today = [
    { time: "08:30", title: "Algorithms Lecture", meta: "CS101 • Room 204" },
    { time: "11:00", title: "Linear Algebra", meta: "MATH204 • Room B12" },
    { time: "14:00", title: "Physics Lab", meta: "PHYS210 • Lab 3" },
  ];

  const upcoming = [
    { title: "Problem Set 4", due: "Tomorrow", course: "MATH204" },
    { title: "Quiz: Trees", due: "Wed", course: "CS101" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SectionHeader
        eyebrow={<span className="inline-flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Dashboard</span>}
        title={<>
          <span className="block">Welcome back</span>
          <span className="gradient-text block">Stay in flow today</span>
        </>}
        subtitle="Your schedule, upcoming work, and quick insights at a glance."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="brand-gradient rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
            <h3 className="font-heading text-xl text-white">
              <span className="block">Today&apos;s Schedule</span>
              <span className="opacity-90 text-sm">Plan • Focus • Execute</span>
            </h3>
            <Clock className="w-4 h-4 text-white/90" />
          </div>
          <div className="space-y-4">
            {today.map((e, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-text-primary">{e.title}</div>
                  <div className="text-sm text-text-secondary">{e.meta}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-border text-text-secondary">{e.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="font-heading text-xl text-text-primary">Upcoming</h3>
          </div>
          <div className="space-y-4">
            {upcoming.map((u, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-text-primary">{u.title}</div>
                  <div className="text-sm text-text-secondary">{u.course}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full brand-chip text-white">{u.due}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
