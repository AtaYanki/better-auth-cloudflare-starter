export * from "./synced-repository";
export * from "./todo-repository";

import type { SyncPublisher } from "@better-auth-cloudflare-starter/sync";
import { TodoRepository } from "./todo-repository";

export type Repositories = {
	todos: TodoRepository;
};

export type CreateRepositoriesOptions = {
	/** Omit outside Worker request contexts (scripts, tests) — defaults to a noop. */
	publisher?: SyncPublisher;
};

export const createRepositories = ({
	publisher,
}: CreateRepositoriesOptions = {}): Repositories => {
	return {
		todos: new TodoRepository(publisher),
	};
};
