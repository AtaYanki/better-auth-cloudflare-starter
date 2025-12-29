export * from "./todo-service";
export * from "./bucket-service";

import { TodoService } from "./todo-service";
import { BucketService } from "./bucket-service";
import type { Repositories } from "@better-auth-cloudflare-starter/db/repositories";

export type Services = {
  todos: TodoService;
  buckets: BucketService;
};

export const createServices = (repositories: Repositories): Services => {
  return {
    todos: new TodoService(repositories.todos),
    buckets: new BucketService(),
  };
};
