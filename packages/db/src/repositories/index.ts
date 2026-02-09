export * from "./todo-repository";

import { TodoRepository } from "./todo-repository";

export type Repositories = {
	todos: TodoRepository;
};

export const createRepositories = (): Repositories => {
	return {
		todos: new TodoRepository(),
	};
};
