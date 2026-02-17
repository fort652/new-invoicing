"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

type LineItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as Id<"invoices">;
  const { user } = useUser();
  
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  const clients = useQuery(
    api.clients.list,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const invoice = useQuery(api.invoices.get, { id: invoiceId });
  const updateInvoice = useMutation(api.invoices.update);

  const [formData, setFormData] = useState({
    clientId: "" as Id<"clients"> | "",
    invoiceNumber: "",
    status: "draft" as "draft" | "sent" | "paid" | "overdue" | "cancelled",
    issueDate: "",
    dueDate: "",
    tax: 0,
    deliveryCost: 0,
    notes: "",
    terms: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (invoice && !isLoaded) {
      setFormData({
        clientId: invoice.clientId,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        issueDate: new Date(invoice.issueDate).toISOString().split("T")[0],
        dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
        tax: invoice.tax,
        deliveryCost: invoice.deliveryCost || 0,
        notes: invoice.notes || "",
        terms: invoice.terms || "",
      });
      
      if (invoice.lineItems && invoice.lineItems.length > 0) {
        setLineItems(invoice.lineItems);
      }
      
      setIsLoaded(true);
    }
  }, [invoice, isLoaded]);

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "rate") {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal + formData.tax + formData.deliveryCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !formData.clientId) return;

    await updateInvoice({
      id: invoiceId,
      clientId: formData.clientId,
      invoiceNumber: formData.invoiceNumber,
      status: formData.status,
      issueDate: new Date(formData.issueDate).getTime(),
      dueDate: new Date(formData.dueDate).getTime(),
      subtotal,
      tax: formData.tax,
      deliveryCost: formData.deliveryCost || undefined,
      total,
      notes: formData.notes || undefined,
      terms: formData.terms || undefined,
      lineItems,
    });

    router.push(`/invoices/${invoiceId}`);
  };

  if (!currentUser || !clients || !invoice || !isLoaded) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Invoice App</h1>
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/invoices" className="text-gray-900 font-semibold">
                Invoices
              </Link>
              <Link href="/clients" className="text-gray-700 hover:text-gray-900">
                Clients
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href={`/invoices/${invoiceId}`} className="text-blue-600 hover:text-blue-800 mb-2 block">
            ← Back to Invoice
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Edit Invoice</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.invoiceNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceNumber: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value as Id<"clients"> })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.issueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "draft" | "sent" | "paid" | "overdue" | "cancelled",
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Line Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Add Item
              </button>
            </div>
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-12 items-end">
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(index, "description", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(index, "quantity", parseFloat(e.target.value) || 0)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        updateLineItem(index, "rate", parseFloat(e.target.value) || 0)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="text"
                      disabled
                      value={item.amount.toFixed(2)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-1">
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="w-full rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end space-y-2 flex-col items-end">
                <div className="flex justify-between w-64">
                  <span className="font-medium">Subtotal:</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64 items-center">
                  <label className="font-medium">Tax:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) =>
                      setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })
                    }
                    className="w-32 rounded-lg border border-gray-300 px-3 py-1 text-right"
                  />
                </div>
                <div className="flex justify-between w-64 items-center">
                  <label className="font-medium">Delivery:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.deliveryCost}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryCost: parseFloat(e.target.value) || 0 })
                    }
                    className="w-32 rounded-lg border border-gray-300 px-3 py-1 text-right"
                  />
                </div>
                <div className="flex justify-between w-64 text-lg font-bold">
                  <span>Total:</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Any additional notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  rows={3}
                  value={formData.terms}
                  onChange={(e) =>
                    setFormData({ ...formData, terms: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Payment terms, conditions..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Link
              href={`/invoices/${invoiceId}`}
              className="rounded-lg border-2 border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Update Invoice
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
