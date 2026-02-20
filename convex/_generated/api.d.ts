/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as clients from "../clients.js";
import type * as invoices from "../invoices.js";
import type * as migrations_removeCustomColors from "../migrations/removeCustomColors.js";
import type * as subscriptions from "../subscriptions.js";
import type * as templates from "../templates.js";
import type * as users from "../users.js";
import type * as wipeAllTables from "../wipeAllTables.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  clients: typeof clients;
  invoices: typeof invoices;
  "migrations/removeCustomColors": typeof migrations_removeCustomColors;
  subscriptions: typeof subscriptions;
  templates: typeof templates;
  users: typeof users;
  wipeAllTables: typeof wipeAllTables;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
