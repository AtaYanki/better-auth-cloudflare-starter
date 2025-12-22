// import { authClient } from "@/lib/auth-client";
// import { authMiddleware } from "@/middleware/auth";
// import { createServerFn } from "@tanstack/react-start";
// // import { getRequestHeaders, getRequest } from "@tanstack/react-start/server";

// export const banUser = createServerFn()
//   .middleware([authMiddleware])
//   .handler(async (ctx: any, input?: { userId: string; banReason?: string; banExpiresIn?: number }) => {
//     // TanStack Start passes mutate data as second parameter when middleware is present
//     let data: { userId: string; banReason?: string; banExpiresIn?: number } = input || {} as any;
    
//     // If not in input, try reading from request body
//     if (!data?.userId) {
//       try {
//         const request = ctx.request || getRequest();
//         const text = await request.text();
//         if (text) {
//           const parsed = JSON.parse(text);
//           data = parsed;
//         }
//       } catch (e) {
//         // Request body might be empty or consumed
//       }
//     }
    
//     // Last resort: check URL params
//     if (!data?.userId) {
//       const request = ctx.request || getRequest();
//       const url = new URL(request.url);
//       const userId = url.searchParams.get("userId");
//       if (userId) {
//         data = { 
//           userId, 
//           banReason: url.searchParams.get("banReason") || undefined,
//           banExpiresIn: url.searchParams.get("banExpiresIn") ? parseInt(url.searchParams.get("banExpiresIn")!) : undefined
//         };
//       }
//     }
    
//     if (!data?.userId) {
//       throw new Error(`Missing userId in request data. Input: ${JSON.stringify(input)}, Ctx keys: ${Object.keys(ctx).join(", ")}`);
//     }
    
//     const result = await authClient.admin.banUser({
//       userId: data.userId,
//       banReason: data.banReason,
//       banExpiresIn: data.banExpiresIn,
//       fetchOptions: {
//         headers: getRequestHeaders(),
//       },
//     });
//     return result;
//   });

// export const unbanUser = createServerFn()
//   .middleware([authMiddleware])
//   .handler(async (ctx: any, input?: { userId: string }) => {
//     let data: { userId: string } = input || {} as any;
    
//     if (!data?.userId) {
//       try {
//         const request = ctx.request || getRequest();
//         const text = await request.text();
//         if (text) {
//           data = JSON.parse(text);
//         }
//       } catch (e) {
//         const request = ctx.request || getRequest();
//         const url = new URL(request.url);
//         const userId = url.searchParams.get("userId");
//         if (userId) {
//           data = { userId };
//         }
//       }
//     }
    
//     if (!data?.userId) {
//       throw new Error(`Missing userId in request data. Input: ${JSON.stringify(input)}`);
//     }
    
//     const result = await authClient.admin.unbanUser({
//       userId: data.userId,
//       fetchOptions: {
//         headers: getRequestHeaders(),
//       },
//     });
//     return result;
//   });

// export const deleteUser = createServerFn()
//   .middleware([authMiddleware])
//   .handler(async (ctx: any, input?: { userId: string }) => {
//     let data: { userId: string } = input || {} as any;
    
//     if (!data?.userId) {
//       try {
//         const request = ctx.request || getRequest();
//         const text = await request.text();
//         if (text) {
//           data = JSON.parse(text);
//         }
//       } catch (e) {
//         const request = ctx.request || getRequest();
//         const url = new URL(request.url);
//         const userId = url.searchParams.get("userId");
//         if (userId) {
//           data = { userId };
//         }
//       }
//     }
    
//     if (!data?.userId) {
//       throw new Error(`Missing userId in request data. Input: ${JSON.stringify(input)}`);
//     }
    
//     const result = await authClient.admin.removeUser({
//       userId: data.userId,
//       fetchOptions: {
//         headers: getRequestHeaders(),
//       },
//     });
//     return result;
//   });

// export const changeUserRole = createServerFn()
//   .handler(async (ctx: any, input?: { userId: string; role: "user" | "admin" }) => {
//     let data: { userId: string; role: "user" | "admin" } = input || {} as any;
    
//     if (!data?.userId || !data?.role) {
//       try {
//         const request = ctx.request || getRequest();
//         const text = await request.text();
//         if (text) {
//           data = JSON.parse(text);
//         }
//       } catch (e) {
//         const request = ctx.request || getRequest();
//         const url = new URL(request.url);
//         const userId = url.searchParams.get("userId");
//         const role = url.searchParams.get("role");
//         if (userId && role) {
//           data = { userId, role: role as "user" | "admin" };
//         }
//       }
//     }
    
//     if (!data?.userId || !data?.role) {
//       throw new Error(`Missing userId or role. Input: ${JSON.stringify(input)}`);
//     }
    
//     const result = await authClient.admin.setRole({
//       userId: data.userId,
//       role: data.role,
//       fetchOptions: {
//         headers: getRequestHeaders(),
//       },
//     });
//     return result;
//   });
