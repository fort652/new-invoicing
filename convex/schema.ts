import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
    // Deprecated: customColors field is no longer used but kept for backwards compatibility
    customColors: v.optional(v.any()),
    planType: v.optional(v.union(v.literal("free"), v.literal("pro"))),
    // Deprecated: old subscription fields - kept for backwards compatibility during migration
    subscriptionStatus: v.optional(v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("cancelled")
    )),
    subscriptionPlan: v.optional(v.union(
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("annually")
    )),
    paystackSubscriptionCode: v.optional(v.string()),
    paystackCustomerCode: v.optional(v.string()),
    subscriptionStartDate: v.optional(v.number()),
    subscriptionEndDate: v.optional(v.number()),
    clientsCreated: v.optional(v.number()),
    invoicesCreated: v.optional(v.number()),
    emailsSent: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"]),

  subscriptions: defineTable({
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
  })
    .index("by_user", ["userId"])
    .index("by_paystack_subscription", ["paystackSubscriptionCode"]),

  usageTracking: defineTable({
    userId: v.id("users"),
    invoiceCount: v.number(),
    clientCount: v.number(),
    emailSendCount: v.number(),
    resetAt: v.number(),
  }).index("by_user", ["userId"]),

  clients: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    country: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  invoices: defineTable({
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
  })
    .index("by_user", ["userId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  lineItems: defineTable({
    invoiceId: v.id("invoices"),
    description: v.string(),
    quantity: v.number(),
    rate: v.number(),
    amount: v.number(),
  }).index("by_invoice", ["invoiceId"]),

  templates: defineTable({
    userId: v.id("users"),
    name: v.string(),
    content: v.string(),
    type: v.union(v.literal("terms"), v.literal("notes")),
  }).index("by_user", ["userId"]).index("by_user_and_type", ["userId", "type"]),
});
