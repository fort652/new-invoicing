"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import PageHeader from "@/app/components/PageHeader";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function ClientsPage() {
  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  const clients = useQuery(
    api.clients.list,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const createClient = useMutation(api.clients.create);
  const deleteClient = useMutation(api.clients.remove);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    await createClient({
      userId: currentUser._id,
      ...formData,
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    });
    setShowForm(false);
  };

  const handleDelete = async (id: Id<"clients">) => {
    if (confirm("Are you sure you want to delete this client?")) {
      await deleteClient({ id });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice App</h1>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/invoices"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Invoices
              </Link>
              <Link
                href="/clients"
                className="text-gray-900 dark:text-white font-semibold"
              >
                Clients
              </Link>
              <Link
                href="/settings"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        <PageHeader description="Manage your client information" />
        
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "Add Client"}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">New Client</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Create Client
              </button>
            </form>
          </div>
        )}

        <div className="rounded-lg bg-white dark:bg-gray-800 shadow">
          {!clients ? (
            <div className="p-8 text-center">Loading...</div>
          ) : clients.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-900 dark:text-white mb-4">No clients yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Add your first client
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Name
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Phone
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Location
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {clients.map((client) => (
                    <tr key={client._id}>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {client.name}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {client.email}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {client.phone || "-"}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {client.city && client.state
                          ? `${client.city}, ${client.state}`
                          : client.city || client.state || "-"}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
