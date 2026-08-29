import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { appRouter } from "./routers.ts";
import { createContext } from "./_core/context.ts";

const handler = createHTTPHandler({
  basePath: "/api/trpc/",
  router: appRouter,
  createContext: ({ req, res }) =>
    createContext({ req, res } as Parameters<typeof createContext>[0]),
});

export default handler;
