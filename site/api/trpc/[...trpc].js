// server/vercel-trpc-handler.ts
import { createHTTPHandler } from "@trpc/server/adapters/standalone";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    domain: void 0,
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  shopifyStoreDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  shopifyStorefrontApiAccessToken: process.env.SHOPIFY_STOREFRONT_API_ACCESS_TOKEN ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/commerce.ts
import { z as z2 } from "zod";

// server/_core/shopify.ts
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/_core/shopifyNormalize.ts
function normalizeMoney(m) {
  return { amount: m.amount, currencyCode: m.currencyCode };
}
function normalizeImage(i) {
  return { url: i.url, altText: i.altText ?? null, width: i.width, height: i.height };
}
function normalizeSelectedOption(o) {
  return { name: o.name, value: o.value };
}
function normalizeProductOption(o) {
  return { name: o.name, values: o.values };
}
function normalizeVariant(v) {
  return {
    id: v.id,
    title: v.title,
    price: normalizeMoney(v.price),
    compareAtPrice: v.compareAtPrice ? normalizeMoney(v.compareAtPrice) : null,
    availableForSale: v.availableForSale,
    selectedOptions: (v.selectedOptions ?? []).map(normalizeSelectedOption)
  };
}
function normalizeProduct(p) {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    productType: p.productType || null,
    vendor: p.vendor || null,
    tags: p.tags ?? [],
    images: p.images.edges.map((e) => normalizeImage(e.node)),
    priceRange: {
      min: normalizeMoney(p.priceRange.minVariantPrice),
      max: normalizeMoney(p.priceRange.maxVariantPrice)
    },
    options: (p.options ?? []).map(normalizeProductOption),
    variants: p.variants.edges.map((e) => normalizeVariant(e.node))
  };
}
function normalizeCollection(c) {
  return {
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description,
    image: c.image ? normalizeImage(c.image) : null
  };
}
function normalizeCartItem(line) {
  const img = line.merchandise.product.images.edges[0]?.node ?? null;
  return {
    lineId: line.id,
    variantId: line.merchandise.id,
    productHandle: line.merchandise.product.handle,
    productTitle: line.merchandise.product.title,
    variantTitle: line.merchandise.title,
    image: img ? normalizeImage(img) : null,
    unitPrice: normalizeMoney(line.merchandise.price),
    quantity: line.quantity,
    lineTotal: normalizeMoney(line.cost.totalAmount)
  };
}
function withChannelParam(checkoutUrl) {
  if (!checkoutUrl) return checkoutUrl;
  return checkoutUrl.includes("?") ? `${checkoutUrl}&channel=online_store` : `${checkoutUrl}?channel=online_store`;
}
function normalizeCart(c) {
  return {
    id: c.id,
    checkoutUrl: withChannelParam(c.checkoutUrl),
    items: c.lines.edges.map((e) => normalizeCartItem(e.node)),
    itemCount: c.totalQuantity,
    subtotal: normalizeMoney(c.cost.subtotalAmount),
    total: normalizeMoney(c.cost.totalAmount)
  };
}

// server/_core/shopify.ts
var SHOPIFY_API_VERSION = "2025-04";
function getShopifyStoreDomain() {
  return process.env.SHOPIFY_STORE_DOMAIN ?? "";
}
function getShopifyStorefrontToken() {
  return process.env.SHOPIFY_STOREFRONT_API_ACCESS_TOKEN ?? "";
}
function isShopifyConfigured() {
  return Boolean(getShopifyStoreDomain() && getShopifyStorefrontToken());
}
function shopifyStorefrontEndpoint() {
  return `https://${getShopifyStoreDomain()}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}
async function storefrontFetch(query, variables) {
  if (!isShopifyConfigured()) {
    throw new TRPCError3({
      code: "INTERNAL_SERVER_ERROR",
      message: "Shopify Storefront API is not configured"
    });
  }
  let response;
  try {
    response = await fetch(shopifyStorefrontEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": getShopifyStorefrontToken()
      },
      body: JSON.stringify({ query, variables })
    });
  } catch (err) {
    console.error("[Shopify] Network error", err);
    throw new TRPCError3({
      code: "INTERNAL_SERVER_ERROR",
      message: "Shopify Storefront API is unreachable"
    });
  }
  if (!response.ok) {
    console.error(
      "[Shopify] HTTP",
      response.status,
      await response.text().catch(() => "")
    );
    throw new TRPCError3({
      code: "INTERNAL_SERVER_ERROR",
      message: `Shopify Storefront API returned HTTP ${response.status}`
    });
  }
  const json = await response.json();
  if (json.errors && json.errors.length) {
    console.error("[Shopify] GraphQL errors", json.errors);
    throw new TRPCError3({
      code: "INTERNAL_SERVER_ERROR",
      message: json.errors[0].message || "Shopify Storefront API error"
    });
  }
  if (!json.data) {
    throw new TRPCError3({
      code: "INTERNAL_SERVER_ERROR",
      message: "Shopify Storefront API returned no data"
    });
  }
  return json.data;
}
function unwrapCart(payload, context) {
  if (payload.userErrors && payload.userErrors.length) {
    console.error(`[Shopify] ${context} userErrors`, payload.userErrors);
    throw new TRPCError3({
      code: "BAD_REQUEST",
      message: payload.userErrors[0].message || `Shopify ${context} failed`
    });
  }
  if (!payload.cart) {
    throw new TRPCError3({
      code: "INTERNAL_SERVER_ERROR",
      message: `Shopify ${context} returned no cart`
    });
  }
  return normalizeCart(payload.cart);
}
var MONEY_FRAGMENT = (
  /* GraphQL */
  `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`
);
var IMAGE_FRAGMENT = (
  /* GraphQL */
  `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`
);
var VARIANT_FRAGMENT = (
  /* GraphQL */
  `
  ${MONEY_FRAGMENT}
  fragment VariantFields on ProductVariant {
    id
    title
    availableForSale
    price { ...MoneyFields }
    compareAtPrice { ...MoneyFields }
    selectedOptions { name value }
  }
`
);
var PRODUCT_FRAGMENT = (
  /* GraphQL */
  `
  ${IMAGE_FRAGMENT}
  ${VARIANT_FRAGMENT}
  fragment ProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    productType
    vendor
    tags
    options { name values }
    priceRange {
      minVariantPrice { ...MoneyFields }
      maxVariantPrice { ...MoneyFields }
    }
    images(first: 8) {
      edges { node { ...ImageFields } }
    }
    variants(first: 25) {
      edges { node { ...VariantFields } }
    }
  }
`
);
var COLLECTION_FRAGMENT = (
  /* GraphQL */
  `
  ${IMAGE_FRAGMENT}
  fragment CollectionFields on Collection {
    id
    handle
    title
    description
    image { ...ImageFields }
  }
`
);
var CART_FRAGMENT = (
  /* GraphQL */
  `
  ${MONEY_FRAGMENT}
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount { ...MoneyFields }
      subtotalAmount { ...MoneyFields }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost { totalAmount { ...MoneyFields } }
          merchandise {
            ... on ProductVariant {
              id
              title
              price { ...MoneyFields }
              product {
                handle
                title
                images(first: 1) {
                  edges { node { url altText width height } }
                }
              }
            }
          }
        }
      }
    }
  }
`
);
async function listProducts(options = {}) {
  const first = options.first ?? 24;
  if (options.collectionHandle) {
    const data2 = await storefrontFetch(
      `${PRODUCT_FRAGMENT}
       query productsByCollection($handle: String!, $first: Int!) {
         collection(handle: $handle) {
           products(first: $first) {
             edges { node { ...ProductFields } }
           }
         }
       }`,
      { handle: options.collectionHandle, first }
    );
    if (!data2.collection) return [];
    return data2.collection.products.edges.map((e) => normalizeProduct(e.node));
  }
  const data = await storefrontFetch(
    `${PRODUCT_FRAGMENT}
     query listProducts($first: Int!) {
       products(first: $first, sortKey: TITLE) {
         edges { node { ...ProductFields } }
       }
     }`,
    { first }
  );
  return data.products.edges.map((e) => normalizeProduct(e.node));
}
async function getProductByHandle(handle) {
  const data = await storefrontFetch(
    `${PRODUCT_FRAGMENT}
     query productByHandle($handle: String!) {
       productByHandle(handle: $handle) { ...ProductFields }
     }`,
    { handle }
  );
  if (!data.productByHandle) {
    throw new TRPCError3({
      code: "NOT_FOUND",
      message: `Product "${handle}" not found`
    });
  }
  return normalizeProduct(data.productByHandle);
}
async function listCollections(first = 10) {
  const data = await storefrontFetch(
    `${COLLECTION_FRAGMENT}
     query listCollections($first: Int!) {
       collections(first: $first) {
         edges { node { ...CollectionFields } }
       }
     }`,
    { first }
  );
  return data.collections.edges.map((e) => normalizeCollection(e.node));
}
async function getCollectionByHandle(handle) {
  const data = await storefrontFetch(
    `${COLLECTION_FRAGMENT}
     query collectionByHandle($handle: String!) {
       collection(handle: $handle) { ...CollectionFields }
     }`,
    { handle }
  );
  if (!data.collection) {
    throw new TRPCError3({
      code: "NOT_FOUND",
      message: `Collection "${handle}" not found`
    });
  }
  return normalizeCollection(data.collection);
}
async function createCart(lines) {
  const data = await storefrontFetch(
    `${CART_FRAGMENT}
     mutation cartCreate($input: CartInput!) {
       cartCreate(input: $input) {
         cart { ...CartFields }
         userErrors { code field message }
       }
     }`,
    {
      input: {
        lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity }))
      }
    }
  );
  return unwrapCart(data.cartCreate, "cartCreate");
}
async function getCart(cartId) {
  const data = await storefrontFetch(
    `${CART_FRAGMENT}
     query getCart($cartId: ID!) {
       cart(id: $cartId) { ...CartFields }
     }`,
    { cartId }
  );
  return data.cart ? normalizeCart(data.cart) : null;
}
async function addCartLines(cartId, lines) {
  const data = await storefrontFetch(
    `${CART_FRAGMENT}
     mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
       cartLinesAdd(cartId: $cartId, lines: $lines) {
         cart { ...CartFields }
         userErrors { code field message }
       }
     }`,
    {
      cartId,
      lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity }))
    }
  );
  return unwrapCart(data.cartLinesAdd, "cartLinesAdd");
}
async function updateCartLines(cartId, updates) {
  const data = await storefrontFetch(
    `${CART_FRAGMENT}
     mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
       cartLinesUpdate(cartId: $cartId, lines: $lines) {
         cart { ...CartFields }
         userErrors { code field message }
       }
     }`,
    {
      cartId,
      lines: updates.map((u) => ({ id: u.lineId, quantity: u.quantity }))
    }
  );
  return unwrapCart(data.cartLinesUpdate, "cartLinesUpdate");
}
async function removeCartLines(cartId, lineIds) {
  const data = await storefrontFetch(
    `${CART_FRAGMENT}
     mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
       cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
         cart { ...CartFields }
         userErrors { code field message }
       }
     }`,
    { cartId, lineIds }
  );
  return unwrapCart(data.cartLinesRemove, "cartLinesRemove");
}

// server/routers/commerce.ts
var cartLineInputSchema = z2.object({
  variantId: z2.string().min(1),
  quantity: z2.number().int().min(1).max(99)
});
var cartLineUpdateSchema = z2.object({
  lineId: z2.string().min(1),
  /** 0 means "remove this line" — the route forwards to removeLines. */
  quantity: z2.number().int().min(0).max(99)
});
var commerceRouter = router({
  products: router({
    list: publicProcedure.input(
      z2.object({
        first: z2.number().int().min(1).max(100).optional(),
        collectionHandle: z2.string().min(1).optional()
      }).optional()
    ).query(async ({ input }) => {
      return listProducts(input ?? {});
    }),
    byHandle: publicProcedure.input(z2.object({ handle: z2.string().min(1) })).query(async ({ input }) => {
      return getProductByHandle(input.handle);
    })
  }),
  collections: router({
    list: publicProcedure.input(z2.object({ first: z2.number().int().min(1).max(50).optional() }).optional()).query(async ({ input }) => {
      return listCollections(input?.first);
    }),
    byHandle: publicProcedure.input(z2.object({ handle: z2.string().min(1) })).query(async ({ input }) => {
      return getCollectionByHandle(input.handle);
    })
  }),
  cart: router({
    create: publicProcedure.input(z2.object({ lines: z2.array(cartLineInputSchema).min(1).max(50) })).mutation(async ({ input }) => {
      return createCart(input.lines);
    }),
    get: publicProcedure.input(z2.object({ cartId: z2.string().min(1) })).query(async ({ input }) => {
      return getCart(input.cartId);
    }),
    addLines: publicProcedure.input(
      z2.object({
        cartId: z2.string().min(1),
        lines: z2.array(cartLineInputSchema).min(1).max(50)
      })
    ).mutation(async ({ input }) => {
      return addCartLines(input.cartId, input.lines);
    }),
    updateLines: publicProcedure.input(
      z2.object({
        cartId: z2.string().min(1),
        lines: z2.array(cartLineUpdateSchema).min(1).max(50)
      })
    ).mutation(async ({ input }) => {
      const toRemove = input.lines.filter((l) => l.quantity === 0).map((l) => l.lineId);
      const toUpdate = input.lines.filter((l) => l.quantity > 0);
      let cart = null;
      if (toUpdate.length) {
        cart = await updateCartLines(input.cartId, toUpdate);
      }
      if (toRemove.length) {
        cart = await removeCartLines(input.cartId, toRemove);
      }
      if (!cart) cart = await getCart(input.cartId);
      return cart;
    }),
    removeLines: publicProcedure.input(
      z2.object({
        cartId: z2.string().min(1),
        lineIds: z2.array(z2.string().min(1)).min(1).max(50)
      })
    ).mutation(async ({ input }) => {
      return removeCartLines(input.cartId, input.lineIds);
    })
  })
});

// server/db.ts
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var orderStatusValues = ["pending_review", "awaiting_payment", "confirmed", "ready_for_pickup", "out_for_delivery", "completed", "cancelled"];
var fulfillmentValues = ["delivery", "pickup"];
var orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => users.id),
  externalOrderId: varchar("externalOrderId", { length: 128 }).unique(),
  status: mysqlEnum("status", orderStatusValues).default("pending_review").notNull(),
  fulfillment: mysqlEnum("fulfillment", fulfillmentValues).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
  subtotalCents: int("subtotalCents").notNull(),
  shippingCents: int("shippingCents"),
  totalCents: int("totalCents").notNull(),
  statusNote: text("statusNote"),
  source: varchar("source", { length: 32 }).default("shopify").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var catalogSyncRuns = mysqlTable("catalogSyncRuns", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 32 }).notNull(),
  mode: mysqlEnum("mode", ["api", "file"]).notNull(),
  status: mysqlEnum("status", ["prepared", "running", "completed", "failed"]).default("prepared").notNull(),
  importedProducts: int("importedProducts").default(0).notNull(),
  duplicateSkus: int("duplicateSkus").default(0).notNull(),
  message: text("message"),
  startedAt: timestamp("startedAt"),
  finishedAt: timestamp("finishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getOrdersForCustomer(customerId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.createdAt));
}

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  commerce: commerceRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie?.(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  orders: router({
    mine: protectedProcedure.query(({ ctx }) => getOrdersForCustomer(ctx.user.id))
  })
  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/supabase.ts
import { createClient } from "@supabase/supabase-js";
var configured = Boolean(ENV.supabaseUrl && ENV.supabasePublishableKey);
var supabase = configured ? createClient(ENV.supabaseUrl, ENV.supabasePublishableKey, {
  auth: { autoRefreshToken: false, persistSession: false }
}) : null;
async function getSupabaseUser(accessToken) {
  if (!supabase || !accessToken) return null;
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  const authorization = opts.req.headers.authorization;
  const bearerToken = typeof authorization === "string" && authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  if (bearerToken) {
    const supabaseUser = await getSupabaseUser(bearerToken);
    if (supabaseUser) {
      const openId = `supabase:${supabaseUser.id}`;
      user = await getUserByOpenId(openId) ?? null;
      if (!user) {
        await upsertUser({
          openId,
          name: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name ?? null,
          email: supabaseUser.email ?? null,
          loginMethod: "supabase"
        });
        user = await getUserByOpenId(openId) ?? null;
      }
    }
  }
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      user = null;
    }
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/vercel-trpc-handler.ts
var handler = createHTTPHandler({
  basePath: "/api/trpc/",
  router: appRouter,
  createContext: ({ req, res }) => createContext({ req, res })
});
var vercel_trpc_handler_default = handler;
export {
  vercel_trpc_handler_default as default
};
