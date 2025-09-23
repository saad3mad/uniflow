import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const month = "September 2025";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SectionHeader
        eyebrow={<span className="inline-flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Calendar</span>}
        title="Plan with clarity"
        subtitle="A clean monthly view with assignments and classes overlaid."
        actions={
          <div className="inline-flex items-center gap-2">
            <button className="btn-secondary inline-flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Prev</button>
            <button className="btn-secondary inline-flex items-center gap-2">Next <ChevronRight className="w-4 h-4" /></button>
          </div>
        }
      />

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-xl text-text-primary">{month}</h3>
          <div className="text-sm text-text-secondary">Assignments and classes</div>
        </div>

        <div className="grid grid-cols-7 gap-3 text-sm">
          {days.map((d) => (
            <div key={d} className="text-text-secondary text-center">{d}</div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[90px] rounded-xl border border-border bg-background-secondary p-2">
              <div className="text-xs text-text-secondary mb-2">{i + 1 <= 30 ? i + 1 : ''}</div>
              {i === 2 && (
                <div className="text-xs px-2 py-1 rounded-full bg-accent-subtle text-accent-secondary mb-1">CS101 Quiz</div>
              )}
              {i === 10 && (
                <div className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-300 mb-1">MATH204 Due</div>
              )}
              {i === 17 && (
                <div className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-300">Study Group</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
