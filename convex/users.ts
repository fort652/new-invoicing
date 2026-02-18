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
      
      // Initialize subscription fields if they don't exist
      if (!existingUser.subscriptionStatus) {
        updates.subscriptionStatus = "free";
      }
      if (existingUser.clientsCreated === undefined) {
        updates.clientsCreated = 0;
      }
      if (existingUser.invoicesCreated === undefined) {
        updates.invoicesCreated = 0;
      }
      if (existingUser.emailsSent === undefined) {
        updates.emailsSent = 0;
      }
      
      await ctx.db.patch(existingUser._id, updates);
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

    // Default to free tier if subscriptionStatus is not set
    const subscriptionStatus = user.subscriptionStatus || "free";
    const isPro = subscriptionStatus === "pro";
    
    // Default counters to 0 if not set
    const clientsCreated = user.clientsCreated ?? 0;
    const invoicesCreated = user.invoicesCreated ?? 0;
    const emailsSent = user.emailsSent ?? 0;
    
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

// Migration function to initialize subscription fields for existing users
export const migrateExistingUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let updated = 0;
    
    for (const user of users) {
      const updates: any = {};
      
      if (!user.subscriptionStatus) {
        updates.subscriptionStatus = "free";
      }
      if (user.clientsCreated === undefined) {
        updates.clientsCreated = 0;
      }
      if (user.invoicesCreated === undefined) {
        updates.invoicesCreated = 0;
      }
      if (user.emailsSent === undefined) {
        updates.emailsSent = 0;
      }
      
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
        updated++;
      }
    }
    
    return { total: users.length, updated };
  },
});
