import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      return subscription || null;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
  },
});

export const getSubscriptionByPaystackCode = query({
  args: { paystackSubscriptionCode: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_paystack_subscription", (q) =>
        q.eq("paystackSubscriptionCode", args.paystackSubscriptionCode)
      )
      .first();

    return subscription;
  },
});

export const createOrUpdateSubscription = mutation({
  args: {
    userId: v.id("users"),
    planType: v.union(v.literal("free"), v.literal("pro")),
    paystackSubscriptionCode: v.optional(v.string()),
    paystackCustomerCode: v.optional(v.string()),
    paystackAuthorizationCode: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("attention")
    ),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingSubscription) {
      await ctx.db.patch(existingSubscription._id, {
        planType: args.planType,
        paystackSubscriptionCode: args.paystackSubscriptionCode,
        paystackCustomerCode: args.paystackCustomerCode,
        paystackAuthorizationCode: args.paystackAuthorizationCode,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });

      await ctx.db.patch(args.userId, {
        planType: args.planType,
      });

      return existingSubscription._id;
    } else {
      const subscriptionId = await ctx.db.insert("subscriptions", {
        userId: args.userId,
        planType: args.planType,
        paystackSubscriptionCode: args.paystackSubscriptionCode,
        paystackCustomerCode: args.paystackCustomerCode,
        paystackAuthorizationCode: args.paystackAuthorizationCode,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });

      await ctx.db.patch(args.userId, {
        planType: args.planType,
      });

      return subscriptionId;
    }
  },
});

export const cancelSubscription = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!subscription) {
      throw new Error("No subscription found");
    }

    await ctx.db.patch(subscription._id, {
      cancelAtPeriodEnd: true,
      status: "cancelled",
    });

    return subscription._id;
  },
});

export const getUsageTracking = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      const usage = await ctx.db
        .query("usageTracking")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      return usage || null;
    } catch (error) {
      console.error("Error fetching usage tracking:", error);
      return null;
    }
  },
});

export const initializeUsageTracking = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existingUsage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingUsage) {
      return existingUsage._id;
    }

    const now = Date.now();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);

    const usageId = await ctx.db.insert("usageTracking", {
      userId: args.userId,
      invoiceCount: 0,
      clientCount: 0,
      emailSendCount: 0,
      resetAt: nextMonth.getTime(),
    });

    return usageId;
  },
});

export const incrementInvoiceCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!usage) {
      const usageId = await ctx.db.insert("usageTracking", {
        userId: args.userId,
        invoiceCount: 1,
        clientCount: 0,
        emailSendCount: 0,
        resetAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
      return usageId;
    }

    await ctx.db.patch(usage._id, {
      invoiceCount: usage.invoiceCount + 1,
    });

    return usage._id;
  },
});

export const incrementClientCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!usage) {
      const usageId = await ctx.db.insert("usageTracking", {
        userId: args.userId,
        invoiceCount: 0,
        clientCount: 1,
        emailSendCount: 0,
        resetAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
      return usageId;
    }

    await ctx.db.patch(usage._id, {
      clientCount: usage.clientCount + 1,
    });

    return usage._id;
  },
});

export const incrementEmailSendCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!usage) {
      const usageId = await ctx.db.insert("usageTracking", {
        userId: args.userId,
        invoiceCount: 0,
        clientCount: 0,
        emailSendCount: 1,
        resetAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
      return usageId;
    }

    await ctx.db.patch(usage._id, {
      emailSendCount: usage.emailSendCount + 1,
    });

    return usage._id;
  },
});

export const checkUsageLimit = query({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("invoice"), v.literal("client"), v.literal("email")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const planType = user.planType || "free";

    if (planType === "pro") {
      return { canProceed: true, limit: Infinity, current: 0 };
    }

    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const limits = {
      free: {
        invoice: 5,
        client: 3,
        email: 5,
      },
    };

    const limit = limits.free[args.type];
    const current = usage
      ? args.type === "invoice"
        ? usage.invoiceCount
        : args.type === "client"
        ? usage.clientCount
        : usage.emailSendCount
      : 0;

    return {
      canProceed: current < limit,
      limit,
      current,
    };
  },
});

export const resetUsageIfNeeded = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!usage) {
      return;
    }

    const now = Date.now();
    if (now >= usage.resetAt) {
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);

      await ctx.db.patch(usage._id, {
        invoiceCount: 0,
        clientCount: 0,
        emailSendCount: 0,
        resetAt: nextMonth.getTime(),
      });
    }
  },
});
