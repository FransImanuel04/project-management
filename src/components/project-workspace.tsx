"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { createProject } from "@/app/actions";
import { Search, Plus, ArrowUpRight, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Project } from "@/db/schema";

type ProjectWorkspaceProps = {
  projects: Project[];
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function ProjectWorkspace({ projects }: ProjectWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return projects;
    return projects.filter((project) =>
      [project.name, project.slug, project.description].filter(Boolean).some((value) =>
        value!.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [projects, query]);

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    startTransition(async () => {
      const result = await createProject(new FormData(form));
      if (result?.error) {
        setError(result.error);
        return;
      }
      form.reset();
      setShowForm(false);
    });
  }

  return (
    <main className="min-h-screen bg-background px-5 py-5 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background">P</div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Project Workspace</p>
              <p className="hidden text-xs text-muted-foreground sm:block">Your projects, in one place</p>
            </div>
          </div>
          <div className="flex items-center gap-2"><ThemeToggle /></div>
        </header>

        <section className="flex flex-col gap-7 pb-10 pt-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-medium text-accent">Workspace overview</p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Good work starts here.</h1>
            <p className="mt-3 max-w-lg text-base text-muted-foreground">Keep your projects focused, visible, and moving forward.</p>
          </div>
          <button type="button" onClick={() => setShowForm(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5">
            <Plus size={16} /> New Project
          </button>
        </section>

        <section className="grid gap-3 border-y border-border py-5 sm:grid-cols-3">
          <div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Workspace insights</p><p className="mt-2 text-2xl font-semibold">{projects.length}</p><p className="text-sm text-muted-foreground">{projects.length === 1 ? "project" : "projects"} in your workspace</p></div>
          <div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Latest addition</p><p className="mt-2 text-2xl font-semibold">{projects[0] ? formatDate(projects[0].createdAt) : "—"}</p><p className="text-sm text-muted-foreground">Most recently created</p></div>
          <div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Visibility</p><p className="mt-2 text-2xl font-semibold">Private</p><p className="text-sm text-muted-foreground">Your workspace is yours</p></div>
        </section>

        <section className="pb-16 pt-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-xl font-semibold tracking-tight">Your projects</h2><p className="mt-1 text-sm text-muted-foreground">Browse and pick up where you left off.</p></div>
            <label className="relative block w-full sm:max-w-xs"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search projects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground" /></label>
          </div>

          {filteredProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => <article key={project.id} className="group flex min-h-52 flex-col justify-between border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-foreground/30 hover:shadow-lg hover:shadow-foreground/5"><div className="flex items-start justify-between gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-sm font-semibold">{project.name.slice(0, 1).toUpperCase()}</div><ArrowUpRight size={17} className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div><div><h3 className="mt-8 text-lg font-semibold tracking-tight">{project.name}</h3><p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">{project.description || "No description yet."}</p><p className="mt-4 text-xs text-muted-foreground">/{project.slug} · {formatDate(project.updatedAt)}</p></div></article>)}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-border bg-card px-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><Search size={19} /></div><h3 className="mt-4 text-lg font-semibold">{projects.length ? "No projects found" : "Your workspace is ready"}</h3><p className="mt-2 max-w-sm text-sm text-muted-foreground">{projects.length ? "Try a different search term." : "Create your first project to give your work a home."}</p>{!projects.length && <button type="button" onClick={() => setShowForm(true)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"><Plus size={15} /> Create project</button>}</div>
          )}
        </section>
      </div>

      {showForm && <div className="fixed inset-0 z-10 flex items-center justify-center bg-foreground/20 px-5 backdrop-blur-sm"><div className="w-full max-w-md border border-border bg-background p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">New project</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Make space for the work.</h2></div><button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close new project form"><X size={19} /></button></div><form onSubmit={submitProject} className="mt-7 space-y-4"><label className="block text-sm font-medium">Name<input name="name" required placeholder="Website redesign" className="mt-2 h-11 w-full border border-border bg-card px-3 text-sm outline-none focus:border-foreground" /></label><label className="block text-sm font-medium">Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="website-redesign" className="mt-2 h-11 w-full border border-border bg-card px-3 text-sm outline-none focus:border-foreground" /></label><label className="block text-sm font-medium">Description<span className="font-normal text-muted-foreground"> (optional)</span><textarea name="description" rows={3} placeholder="What are you building?" className="mt-2 w-full resize-none border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground" /></label>{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={isPending} className="flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background disabled:opacity-50">{isPending ? "Creating..." : "Create project"}</button></form></div></div>}
    </main>
  );
}