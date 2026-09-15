"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { createProject, deleteProject, updateProject } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Project } from "@/db/schema";

type ProjectWorkspaceProps = { projects: Project[] };
type ProjectFormProps = { project?: Project; onClose: () => void };

const iconOptions = ["folder", "spark", "rocket", "code", "palette"];
const colorOptions = ["#d7774b", "#4d8a78", "#6c78b8", "#b36b9a", "#c49a4d"];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function ProjectForm({ project, onClose }: ProjectFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(project);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    startTransition(async () => {
      const result = project
        ? await updateProject(project.id, new FormData(form))
        : await createProject(new FormData(form));
      if (result?.error) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-foreground/20 px-5 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto border border-border bg-background p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{isEditing ? "Edit project" : "New project"}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{isEditing ? "Refine the details." : "Make space for the work."}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close project dialog"><X size={19} /></button>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-medium">Name<input name="name" required defaultValue={project?.name} placeholder="Website redesign" className="mt-2 h-11 w-full border border-border bg-card px-3 text-sm outline-none focus:border-foreground" /></label>
          <label className="block text-sm font-medium">Key<input name="key" required pattern="[A-Za-z][A-Za-z0-9_-]*" defaultValue={project?.key} placeholder="WEB" className="mt-2 h-11 w-full border border-border bg-card px-3 text-sm uppercase outline-none focus:border-foreground" /></label>
          <label className="block text-sm font-medium">Description<span className="font-normal text-muted-foreground"> (optional)</span><textarea name="description" rows={3} defaultValue={project?.description ?? ""} placeholder="What are you building?" className="mt-2 w-full resize-none border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground" /></label>
          <div><p className="text-sm font-medium">Icon</p><div className="mt-2 flex flex-wrap gap-2">{iconOptions.map((icon) => <label key={icon} className="cursor-pointer"><input type="radio" name="icon" value={icon} defaultChecked={(project?.icon ?? "folder") === icon} className="peer sr-only" /><span className="inline-flex h-9 items-center rounded-full border border-border px-3 text-xs capitalize peer-checked:border-foreground peer-checked:bg-muted">{icon}</span></label>)}</div></div>
          <div><p className="text-sm font-medium">Icon color</p><div className="mt-2 flex gap-3">{colorOptions.map((color) => <label key={color} className="cursor-pointer"><input type="radio" name="iconColor" value={color} defaultChecked={(project?.iconColor ?? colorOptions[0]) === color} className="peer sr-only" /><span className="block h-7 w-7 rounded-full border-2 border-background outline outline-1 outline-border peer-checked:outline-2 peer-checked:outline-foreground" style={{ backgroundColor: color }} aria-label={color} /></label>)}</div></div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button disabled={isPending} className="flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background disabled:opacity-50">{isPending ? "Saving..." : isEditing ? "Save changes" : "Create project"}</button>
        </form>
      </div>
    </div>
  );
}

function iconGlyph(icon: string) {
  return icon === "folder" ? "▰" : icon === "spark" ? "✦" : icon === "rocket" ? "↗" : icon === "code" ? "<>" : "●";
}

export function ProjectWorkspace({ projects }: ProjectWorkspaceProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<"create" | Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return projects;
    return projects.filter((project) =>
      [project.name, project.key, project.description].filter(Boolean).some((value) => value!.toLowerCase().includes(normalizedQuery)),
    );
  }, [projects, query]);

  function confirmDelete() {
    if (!deleteTarget) return;
    setOperationError(null);
    startDelete(async () => {
      const result = await deleteProject(deleteTarget.id);
      if (result?.error) {
        setOperationError(result.error);
        return;
      }
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function closeDialog() {
    setDialog(null);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background px-5 py-5 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between border-b border-border pb-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background">P</div><div><p className="text-sm font-semibold tracking-tight">Project Workspace</p><p className="hidden text-xs text-muted-foreground sm:block">Your projects, in one place</p></div></div><ThemeToggle /></header>
        <section className="flex flex-col gap-7 pb-10 pt-12 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-3 text-sm font-medium text-accent">Workspace overview</p><h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Good work starts here.</h1><p className="mt-3 max-w-lg text-base text-muted-foreground">Keep your projects focused, visible, and moving forward.</p></div><button type="button" onClick={() => setDialog("create")} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"><Plus size={16} /> New Project</button></section>
        <section className="grid gap-3 border-y border-border py-5 sm:grid-cols-3"><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Workspace insights</p><p className="mt-2 text-2xl font-semibold">{projects.length}</p><p className="text-sm text-muted-foreground">{projects.length === 1 ? "project" : "projects"} in your workspace</p></div><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Latest addition</p><p className="mt-2 text-2xl font-semibold">{projects[0] ? formatDate(projects[0].createdAt) : "—"}</p><p className="text-sm text-muted-foreground">Most recently created</p></div><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Visibility</p><p className="mt-2 text-2xl font-semibold">Private</p><p className="text-sm text-muted-foreground">Your workspace is yours</p></div></section>
        <section className="pb-16 pt-8"><div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold tracking-tight">Your projects</h2><p className="mt-1 text-sm text-muted-foreground">Browse and pick up where you left off.</p></div><label className="relative block w-full sm:max-w-xs"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search projects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground" /></label></div>
          {filteredProjects.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredProjects.map((project) => <article key={project.id} className="group flex min-h-52 flex-col justify-between border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-foreground/30 hover:shadow-lg hover:shadow-foreground/5"><div className="flex items-start justify-between gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold" style={{ backgroundColor: `${project.iconColor}22`, color: project.iconColor }}>{iconGlyph(project.icon)}</div><div className="flex items-center gap-1"><button type="button" onClick={() => setDialog(project)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Edit ${project.name}`} title="Edit project"><Pencil size={15} /></button><button type="button" onClick={() => setDeleteTarget(project)} className="rounded-full p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${project.name}`} title="Delete project"><Trash2 size={15} /></button><ArrowUpRight size={17} className="ml-1 text-muted-foreground" /></div></div><div><h3 className="mt-8 text-lg font-semibold tracking-tight">{project.name}</h3><p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">{project.description || "No description yet."}</p><p className="mt-4 text-xs text-muted-foreground">{project.key} · updated {formatDate(project.updatedAt)}</p></div></article>)}</div> : <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-border bg-card px-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><Search size={19} /></div><h3 className="mt-4 text-lg font-semibold">{projects.length ? "No projects found" : "Your workspace is ready"}</h3><p className="mt-2 max-w-sm text-sm text-muted-foreground">{projects.length ? "Try a different search term." : "Create your first project to give your work a home."}</p>{!projects.length && <button type="button" onClick={() => setDialog("create")} className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"><Plus size={15} /> Create project</button>}</div>}
        </section>
      </div>
      {dialog && <ProjectForm project={dialog === "create" ? undefined : dialog} onClose={closeDialog} />}
      {deleteTarget && <div className="fixed inset-0 z-20 flex items-center justify-center bg-foreground/20 px-5 backdrop-blur-sm"><div className="w-full max-w-sm border border-border bg-background p-6 shadow-2xl"><h2 className="text-xl font-semibold">Delete {deleteTarget.name}?</h2><p className="mt-2 text-sm text-muted-foreground">This action cannot be undone.</p>{operationError && <p role="alert" className="mt-4 text-sm text-red-600">{operationError}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeleteTarget(null)} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button><button type="button" onClick={confirmDelete} disabled={isDeleting} className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{isDeleting ? "Deleting..." : "Delete project"}</button></div></div></div>}
</main>
  );
}
