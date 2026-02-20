import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Wipes all documents from every table. Run from CLI only:
 *
 *   npx convex run wipeAllTables:wipeAllTables '{"confirm":"WIPE_ALL_DATA"}'
 *
 * Deletes in dependency order (children first). Requires confirm to avoid accidental runs.
 */
export const wipeAllTables = mutation({
  args: {
    confirm: v.literal("WIPE_ALL_DATA"),
  },
  handler: async (ctx) => {
    const tables = [
      "lineItems",
      "invoices",
      "clients",
      "templates",
      "usageTracking",
      "subscriptions",
      "users",
    ] as const;

    const counts: Record<string, number> = {};
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      counts[table] = docs.length;
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    return { wiped: tables, deleted: counts };
  },
});
