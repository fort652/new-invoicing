import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const planType = user.planType || "free";
    const isPro = planType === "pro";

    if (!isPro) {
      const usage = await ctx.db
        .query("usageTracking")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      const clientCount = usage?.clientCount ?? 0;

      if (clientCount >= 3) {
        throw new Error("Free tier limit reached. Upgrade to Pro to create unlimited clients.");
      }

      const clientId = await ctx.db.insert("clients", args);

      if (usage) {
        await ctx.db.patch(usage._id, {
          clientCount: clientCount + 1,
        });
      } else {
        await ctx.db.insert("usageTracking", {
          userId: args.userId,
          clientCount: 1,
          invoiceCount: 0,
          emailSendCount: 0,
          resetAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });
      }

      return clientId;
    }

    return await ctx.db.insert("clients", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
