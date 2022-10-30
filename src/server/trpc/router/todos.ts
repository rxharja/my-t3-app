import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const todoRouter = router({
  getAllLists: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.todoList.findMany({
      where: { userId: ctx.session.user.id },
      include: { TodoItems: { where: { done: false } } },
    })
  ),
  getList: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.todoList.findFirstOrThrow({
        where: { id: input.id, userId: ctx.session.user.id },
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
  addList: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.todoList.create({
        data: { name: input.name, userId: ctx.session.user.id },
      });
    }),
  addItem: protectedProcedure
    .input(z.object({ name: z.string(), listId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.todoItem.create({
        data: { name: input.name, todoListId: input.listId },
      });
    }),
});
