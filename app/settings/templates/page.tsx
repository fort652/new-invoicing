"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function TemplatesPage() {
  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  const templates = useQuery(
    api.templates.list,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const createTemplate = useMutation(api.templates.create);
  const updateTemplate = useMutation(api.templates.update);
  const deleteTemplate = useMutation(api.templates.remove);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"templates"> | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    type: "terms" as "terms" | "notes",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (editingId) {
      await updateTemplate({
        id: editingId,
        name: formData.name,
        content: formData.content,
      });
      setEditingId(null);
    } else {
      await createTemplate({
        userId: currentUser._id,
        ...formData,
      });
    }

    setFormData({ name: "", content: "", type: "terms" });
    setShowForm(false);
  };

  const handleEdit = (template: any) => {
    setFormData({
      name: template.name,
      content: template.content,
      type: template.type,
    });
    setEditingId(template._id);
    setShowForm(true);
  };

  const handleDelete = async (id: Id<"templates">) => {
    if (confirm("Are you sure you want to delete this template?")) {
      await deleteTemplate({ id });
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", content: "", type: "terms" });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice App</h1>
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Dashboard
              </Link>
              <Link href="/invoices" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Invoices
              </Link>
              <Link href="/clients" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Clients
              </Link>
              <Link href="/settings" className="text-gray-900 dark:text-white font-semibold">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Templates</h2>
            <p className="mt-2 text-gray-900 dark:text-gray-300">
              Manage your Terms & Conditions and Notes templates
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "New Template"}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingId ? "Edit Template" : "New Template"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700"
                    placeholder="e.g., Standard Terms & Conditions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as "terms" | "notes" })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700"
                    disabled={!!editingId}
                  >
                    <option value="terms">Terms & Conditions</option>
                    <option value="notes">Notes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
                  Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700"
                  placeholder="Enter your template content..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                >
                  {editingId ? "Update Template" : "Create Template"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border-2 border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-lg bg-white dark:bg-gray-800 shadow">
          {!templates ? (
            <div className="p-8 text-center text-gray-900 dark:text-white">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-900 dark:text-white mb-4">No templates yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Create your first template
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {templates.map((template) => (
                <div key={template._id} className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <span className="inline-block mt-1 rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-xs font-semibold text-blue-800 dark:text-blue-200">
                        {template.type === "terms" ? "Terms & Conditions" : "Notes"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(template._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-900 dark:text-gray-300 whitespace-pre-wrap mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {template.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
