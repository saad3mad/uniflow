import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import { FileText, Plus, Search, Tag } from "lucide-react";

export default function NotesPage() {
  const notes = [
    { title: "DSA: Trees & Graphs", snippet: "Balanced trees vs hash maps...", tags: ["CS101", "algorithms"] },
    { title: "Linear Algebra: Eigenvalues", snippet: "Eigen decomposition intuition...", tags: ["MATH204"] },
    { title: "Physics: Relativity", snippet: "Time dilation thought experiment...", tags: ["PHYS210"] },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SectionHeader
        eyebrow={<span className="inline-flex items-center gap-2"><FileText className="w-4 h-4" /> Notes</span>}
        title="Capture and organize your ideas"
        subtitle="Fast note capture with tags and quick search so you stay in flow."
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input placeholder="Search notes" className="pl-9 pr-3 py-2 rounded-lg bg-background-secondary border border-border text-sm focus-ring" />
            </div>
            <button className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> New Note</button>
          </div>
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((n, i) => (
          <Card key={i}>
            <h3 className="font-heading text-xl text-text-primary mb-2">{n.title}</h3>
            <p className="text-text-secondary text-sm mb-4">{n.snippet}</p>
            <div className="flex gap-2 flex-wrap">
              {n.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-border text-text-secondary">
                  <Tag className="w-3 h-3" /> {t}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
