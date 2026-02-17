import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { 
    userId: v.id("users"),
    type: v.optional(v.union(v.literal("terms"), v.literal("notes"))),
  },
  handler: async (ctx, args) => {
    if (args.type !== undefined) {
      return await ctx.db
        .query("templates")
        .withIndex("by_user_and_type", (q) => 
          q.eq("userId", args.userId).eq("type", args.type!)
        )
        .order("desc")
        .collect();
    }
    
    return await ctx.db
      .query("templates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("templates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    content: v.string(),
    type: v.union(v.literal("terms"), v.literal("notes")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("templates", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("templates"),
    name: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("templates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
