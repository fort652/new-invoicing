import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      const updates: any = {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      };
      
      if (!existingUser.planType) {
        updates.planType = "free";
      }
      
      await ctx.db.patch(existingUser._id, updates);
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      planType: "free",
    });
  },
});

export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const hasAnyUser = query({
  args: {},
  handler: async (ctx) => {
    const first = await ctx.db.query("users").first();
    return first !== null;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const updateTheme = mutation({
  args: {
    userId: v.id("users"),
    theme: v.union(v.literal("light"), v.literal("dark")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { theme: args.theme });
  },
});

export const checkUsageLimits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const planType = user.planType || "free";
    const isPro = planType === "pro";
    
    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    const clientsCreated = usage?.clientCount ?? 0;
    const invoicesCreated = usage?.invoiceCount ?? 0;
    const emailsSent = usage?.emailSendCount ?? 0;
    
    return {
      isPro,
      canCreateClient: isPro || clientsCreated < 3,
      canCreateInvoice: isPro || invoicesCreated < 5,
      canSendEmail: isPro || emailsSent < 5,
      clientsUsed: clientsCreated,
      invoicesUsed: invoicesCreated,
      emailsUsed: emailsSent,
      clientsLimit: isPro ? -1 : 3,
      invoicesLimit: isPro ? -1 : 5,
      emailsLimit: isPro ? -1 : 5,
    };
  },
});
