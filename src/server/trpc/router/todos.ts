import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const todoRouter = router({
  getAllLists: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.todoList.findMany()
  ),
  getList: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.todoList.findUniqueOrThrow({
        where: { id: input.id },
        include: { TodoItems: true },
      })
    ),
  updateItemCompletion: protectedProcedure
    .input(z.object({ id: z.string(), done: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.todoItem.update({
        where: { id: input.id },
        data: { done: input.done },
      });
    }),
});
