"use client"

import { useState } from "react"
import { Plus, Save, Pencil, Trash2, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Section = "education" | "experience" | "projects" | "skills"

interface ResumeItem {
  id: string
  title: string
  description: string
  time: string
}

interface ResumeData {
  education: ResumeItem[]
  experience: ResumeItem[]
  projects: ResumeItem[]
  skills: ResumeItem[]
}

const sections: { id: Section; label: string }[] = [
  { id: "education", label: "EDUCATION" },
  { id: "experience", label: "EXPERIENCE" },
  { id: "projects", label: "PROJECTS" },
  { id: "skills", label: "SKILLS" },
]

export function ResumeBuilder() {
  const [activeSection, setActiveSection] = useState<Section>("education")
  const [resumeData, setResumeData] = useState<ResumeData>({
    education: [],
    experience: [],
    projects: [],
    skills: [],
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ title: "", description: "", time: "" })
  const [isExporting, setIsExporting] = useState(false)
  const isSkillsSection = activeSection === "skills"

  const handleAddItem = () => {
    if (!formData.title.trim()) return

    const newItem: ResumeItem = {
      id: crypto.randomUUID(),
      title: formData.title,
      description: isSkillsSection ? "" : formData.description,
      time: isSkillsSection ? "" : formData.time,
    }

    setResumeData((prev) => ({
      ...prev,
      [activeSection]: [...prev[activeSection], newItem],
    }))

    setFormData({ title: "", description: "", time: "" })
    setIsAdding(false)
  }

  const handleEditItem = (item: ResumeItem) => {
    setEditingId(item.id)
    setFormData({ title: item.title, description: item.description, time: item.time })
  }

  const handleSaveEdit = () => {
    if (!editingId || !formData.title.trim()) return

    setResumeData((prev) => ({
      ...prev,
      [activeSection]: prev[activeSection].map((item) =>
        item.id === editingId
          ? {
              ...item,
              title: formData.title,
              description: isSkillsSection ? "" : formData.description,
              time: isSkillsSection ? "" : formData.time,
            }
          : item
      ),
    }))

    setEditingId(null)
    setFormData({ title: "", description: "", time: "" })
  }

  const handleDeleteItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      [activeSection]: prev[activeSection].filter((item) => item.id !== id),
    }))
  }

  const exportJSON = async () => {
    setIsExporting(true)

    try {
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: resumeData,
          filename: "resume.json",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save resume JSON")
      }

      alert("Resume JSON saved to backend/resume/resume.json")
    } catch (error) {
      console.error(error)
      alert("Unable to save resume JSON to backend folder")
    } finally {
      setIsExporting(false)
    }
  }

  const currentItems = resumeData[activeSection]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Vertical Line Sidebar */}
      <div className="relative w-32 flex-shrink-0">
        <nav className="sticky top-0 h-screen">
          {/* Vertical line running full height, centered horizontally */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />

          {/* Section labels evenly distributed */}
          <div className="relative flex h-full flex-col items-center justify-evenly py-16">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id)
                  setIsAdding(false)
                  setEditingId(null)
                  setFormData({ title: "", description: "", time: "" })
                }}
                className="group relative z-10 flex items-center justify-center"
              >
                {/* Background block that covers/interrupts the vertical line */}
                <span
                  className={cn(
                    "relative block bg-background px-2 py-1 text-[10px] font-semibold tracking-widest transition-all duration-300",
                    activeSection === section.id
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {section.label}
                  {/* Active underline indicator */}
                  <span
                    className={cn(
                      "absolute bottom-0 left-1/2 h-px -translate-x-1/2 transition-all duration-300",
                      activeSection === section.id ? "w-full bg-primary" : "w-0"
                    )}
                  />
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-8 py-12 lg:px-16">
        <div className="mx-auto max-w-3xl">
          {/* Section Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {sections.find((s) => s.id === activeSection)?.label}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={exportJSON}
              disabled={isExporting}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Save className="h-4 w-4" />
              {isExporting ? "Saving..." : "Export JSON"}
            </Button>
          </div>

          {/* Add Button */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="group mb-8 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-6 text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary"
            >
              <Plus className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Add {activeSection.slice(0, -1)}</span>
            </button>
          )}

          {/* Add Form */}
          {isAdding && (
            <div className="mb-8 rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">New Item</h3>
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setFormData({ title: "", description: "", time: "" })
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-background"
                />
                {!isSkillsSection && (
                  <>
                    <Textarea
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="min-h-24 bg-background"
                    />
                    <Input
                      placeholder="Time (e.g., 2023 - Present)"
                      value={formData.time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                      className="bg-background"
                    />
                  </>
                )}
                <Button onClick={handleAddItem} className="gap-2">
                  <Check className="h-4 w-4" />
                  Save Item
                </Button>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="space-y-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:border-primary/50"
              >
                {editingId === item.id ? (
                  <div className="space-y-4">
                    <Input
                      placeholder="Title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="bg-background"
                    />
                    {!isSkillsSection && (
                      <>
                        <Textarea
                          placeholder="Description"
                          value={formData.description}
                          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                          className="min-h-24 bg-background"
                        />
                        <Input
                          placeholder="Time"
                          value={formData.time}
                          onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                          className="bg-background"
                        />
                      </>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm" className="gap-2">
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(null)
                          setFormData({ title: "", description: "", time: "" })
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-4">
                          <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                          {!isSkillsSection && item.time && (
                            <span className="text-sm text-primary">{item.time}</span>
                          )}
                        </div>
                        {!isSkillsSection && item.description && (
                          <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditItem(item)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {currentItems.length === 0 && !isAdding && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No items yet. Click the + button above to add your first {activeSection.slice(0, -1)}.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
