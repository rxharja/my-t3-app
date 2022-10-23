// src/server/trpc/router/_app.ts
import { router } from "../trpc";
import { authRouter } from "./auth";
import { todoRouter } from "./todos";

export const appRouter = router({
  todoLists: todoRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
