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
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      subscriptionStatus: "free",
      clientsCreated: 0,
      invoicesCreated: 0,
      emailsSent: 0,
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

    const isPro = user.subscriptionStatus === "pro";
    
    return {
      isPro,
      canCreateClient: isPro || (user.clientsCreated || 0) < 3,
      canCreateInvoice: isPro || (user.invoicesCreated || 0) < 5,
      canSendEmail: isPro || (user.emailsSent || 0) < 5,
      clientsUsed: user.clientsCreated || 0,
      invoicesUsed: user.invoicesCreated || 0,
      emailsUsed: user.emailsSent || 0,
      clientsLimit: isPro ? -1 : 3,
      invoicesLimit: isPro ? -1 : 5,
      emailsLimit: isPro ? -1 : 5,
    };
  },
});

export const incrementClientCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    await ctx.db.patch(args.userId, {
      clientsCreated: (user.clientsCreated || 0) + 1,
    });
  },
});

export const incrementInvoiceCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    await ctx.db.patch(args.userId, {
      invoicesCreated: (user.invoicesCreated || 0) + 1,
    });
  },
});

export const incrementEmailCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    await ctx.db.patch(args.userId, {
      emailsSent: (user.emailsSent || 0) + 1,
    });
  },
});

export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscriptionStatus: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("cancelled")
    ),
    subscriptionPlan: v.optional(v.union(
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("annually")
    )),
    paystackSubscriptionCode: v.optional(v.string()),
    paystackCustomerCode: v.optional(v.string()),
    subscriptionStartDate: v.optional(v.number()),
    subscriptionEndDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
  },
});
