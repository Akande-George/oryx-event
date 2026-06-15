"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAdminData } from "@/lib/admin/context";
import PageHeader from "../_components/PageHeader";

export default function AdminCategoriesPage() {
  const { categories, createCategory, deleteCategory } = useAdminData();
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎉");
  const [deleteOpenId, setDeleteOpenId] = useState<string | null>(null);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const cat = await createCategory({ name, emoji: newEmoji.trim() || "🎉" });
    if (cat) {
      setNewName("");
      setNewEmoji("🎉");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteCategory(id);
    if (ok) setDeleteOpenId(null);
  };

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Manage event categories shown across the site"
      />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="p-5 rounded-xl border border-border bg-white">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-4">
            Add New Category
          </h3>
          <div className="flex gap-3 flex-wrap">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Emoji"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-20 text-center text-lg"
                maxLength={4}
              />
              <Input
                placeholder="Category name, e.g. Wellness"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-64"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <Button
              className="gradient-primary border-0 text-white gap-2"
              onClick={handleAdd}
              disabled={!newName.trim()}
            >
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-white group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.emoji}</span>
                <span className="font-medium text-foreground text-sm">
                  {cat.name}
                </span>
              </div>
              <Dialog
                open={deleteOpenId === cat.id}
                onOpenChange={(open) =>
                  setDeleteOpenId(open ? cat.id : null)
                }
              >
                <DialogTrigger
                  render={
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      aria-label={`Delete ${cat.name}`}
                    />
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="font-heading">
                      Delete &ldquo;{cat.name}&rdquo;?
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    This will remove the category from the list. Events already
                    using it will keep their value, but it won&apos;t appear as
                    a filter option.
                  </p>
                  <DialogFooter className="mt-4 flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteOpenId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-16 text-sm text-muted-foreground bg-muted/20 rounded-2xl border border-border/50">
            No categories yet. Add one above.
          </div>
        )}
      </div>
    </>
  );
}
