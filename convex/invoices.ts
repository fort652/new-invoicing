import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const invoicesWithClients = await Promise.all(
      invoices.map(async (invoice) => {
        const client = await ctx.db.get(invoice.clientId);
        return { ...invoice, client };
      })
    );

    return invoicesWithClients;
  },
});

export const get = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) return null;

    const client = await ctx.db.get(invoice.clientId);
    const lineItems = await ctx.db
      .query("lineItems")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", args.id))
      .collect();

    return { ...invoice, client, lineItems };
  },
});

export const getByStatus = query({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", args.userId).eq("status", args.status)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    clientId: v.id("clients"),
    invoiceNumber: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
    issueDate: v.number(),
    dueDate: v.number(),
    subtotal: v.number(),
    tax: v.number(),
    deliveryCost: v.optional(v.number()),
    total: v.number(),
    notes: v.optional(v.string()),
    terms: v.optional(v.string()),
    lineItems: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        rate: v.number(),
        amount: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { lineItems, ...invoiceData } = args;

    const invoiceId = await ctx.db.insert("invoices", invoiceData);

    for (const item of lineItems) {
      await ctx.db.insert("lineItems", {
        invoiceId,
        ...item,
      });
    }

    return invoiceId;
  },
});

export const update = mutation({
  args: {
    id: v.id("invoices"),
    clientId: v.optional(v.id("clients")),
    invoiceNumber: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("paid"),
        v.literal("overdue"),
        v.literal("cancelled")
      )
    ),
    issueDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    subtotal: v.optional(v.number()),
    tax: v.optional(v.number()),
    deliveryCost: v.optional(v.number()),
    total: v.optional(v.number()),
    notes: v.optional(v.string()),
    terms: v.optional(v.string()),
    lineItems: v.optional(
      v.array(
        v.object({
          description: v.string(),
          quantity: v.number(),
          rate: v.number(),
          amount: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, lineItems, ...updates } = args;

    await ctx.db.patch(id, updates);

    if (lineItems) {
      const existingItems = await ctx.db
        .query("lineItems")
        .withIndex("by_invoice", (q) => q.eq("invoiceId", id))
        .collect();

      for (const item of existingItems) {
        await ctx.db.delete(item._id);
      }

      for (const item of lineItems) {
        await ctx.db.insert("lineItems", {
          invoiceId: id,
          ...item,
        });
      }
    }
  },
});

export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const lineItems = await ctx.db
      .query("lineItems")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", args.id))
      .collect();

    for (const item of lineItems) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const stats = {
      total: invoices.length,
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
      totalRevenue: 0,
      paidRevenue: 0,
      pendingRevenue: 0,
    };

    for (const invoice of invoices) {
      stats[invoice.status]++;
      stats.totalRevenue += invoice.total;

      if (invoice.status === "paid") {
        stats.paidRevenue += invoice.total;
      } else if (invoice.status === "sent" || invoice.status === "overdue") {
        stats.pendingRevenue += invoice.total;
      }
    }

    return stats;
  },
});
