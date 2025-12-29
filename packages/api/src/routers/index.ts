import { z } from "zod";
import { env } from "cloudflare:workers";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../index";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  uploadFile: protectedProcedure
    .input(z.instanceof(FormData))
    .mutation(async ({ ctx, input }) => {
      const file = input.get("file") as File;
      if (!file) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File is required",
        });
      }

      if (file.size > 1024 * 1024 * 5) {
        // 5MB
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File size is too large",
          cause: `File size is ${file.size} bytes, max size is 5MB`,
        });
      }
      
      const data = await ctx.context.env.PUBLIC_BUCKET.put(
        file.name,
        file.stream()
      );
      if (!data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload file",
        });
      }
      return {
        url: `${env.BUCKET_URL}/${data.key}`,
      };
    }),
  deleteFile: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { key } = input;
      await ctx.context.env.PUBLIC_BUCKET.delete(key);
      return {
        message: "File deleted successfully",
      };
    }),
});
export type AppRouter = typeof appRouter;
