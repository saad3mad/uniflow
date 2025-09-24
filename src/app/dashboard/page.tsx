"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import { CalendarDays, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    // Avoid redirect loop by waiting until auth loading is complete
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (!error) setFullName(data?.full_name ?? null);
    }
    loadProfile();
  }, [user]);

  const today = [
    { time: "08:30", title: "Algorithms Lecture", meta: "CS101 • Room 204" },
    { time: "11:00", title: "Linear Algebra", meta: "MATH204 • Room B12" },
    { time: "14:00", title: "Physics Lab", meta: "PHYS210 • Lab 3" },
  ];

  const upcoming = [
    { title: "Problem Set 4", due: "Tomorrow", course: "MATH204" },
    { title: "Quiz: Trees", due: "Wed", course: "CS101" },
  ];

  if (loading || !user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SectionHeader
        eyebrow={<span className="inline-flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Dashboard</span>}
        title={<>
          <span className="block">Welcome{fullName ? `, ${fullName}` : ""}</span>
          <span className="gradient-text block">Stay in flow today</span>
        </>}
        subtitle={`Your schedule, upcoming work, and quick insights at a glance${!fullName && user?.email ? ` • Signed in as ${user.email}` : ""}.`}
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

      {/* Quick access cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-10">
        <a href="/courses">
          <Card className="p-6 hover-lift">
            <h3 className="font-semibold text-lg">Courses</h3>
            <p className="text-text-secondary text-sm">Manage your enrolled courses</p>
          </Card>
        </a>
        <a href="/notes">
          <Card className="p-6 hover-lift">
            <h3 className="font-semibold text-lg">Notes</h3>
            <p className="text-text-secondary text-sm">Organize and search your notes</p>
          </Card>
        </a>
        <a href="/assignments">
          <Card className="p-6 hover-lift">
            <h3 className="font-semibold text-lg">Assignments</h3>
            <p className="text-text-secondary text-sm">Track deadlines and progress</p>
          </Card>
        </a>
        <a href="/calendar">
          <Card className="p-6 hover-lift">
            <h3 className="font-semibold text-lg">Calendar</h3>
            <p className="text-text-secondary text-sm">Plan your academic schedule</p>
          </Card>
        </a>
      </div>
    </div>
  );
}
