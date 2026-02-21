import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useCheckoutEmbed, useSubscriptionStatus } from "@/hooks/use-polar";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/__authenticated/todos")({
	component: TodosPage,
});

const FREE_TIER_LIMIT = 10;

function TodosPage() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const { data: session } = authClient.useSession();
	const { data: subscriptionStatus } = useSubscriptionStatus({
		enabled: !!session,
	});
	const checkoutEmbed = useCheckoutEmbed();

	const hasPro = subscriptionStatus?.isProActive ?? false;

	const todos = useQuery(trpc.todo.list.queryOptions());
	const stats = useQuery(trpc.todo.stats.queryOptions());

	const invalidateTodos = () => {
		queryClient.invalidateQueries({ queryKey: trpc.todo.list.queryKey() });
		queryClient.invalidateQueries({ queryKey: trpc.todo.stats.queryKey() });
	};

	const createTodo = useMutation(
		trpc.todo.create.mutationOptions({
			onSuccess: () => {
				toast.success("Todo created!");
				setTitle("");
				setDescription("");
				invalidateTodos();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const toggleTodo = useMutation(
		trpc.todo.toggleComplete.mutationOptions({
			onSuccess: () => {
				invalidateTodos();
			},
		}),
	);

	const deleteTodo = useMutation(
		trpc.todo.delete.mutationOptions({
			onSuccess: () => {
				toast.success("Todo deleted!");
				invalidateTodos();
			},
		}),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		createTodo.mutate({
			title: title.trim(),
			description: description.trim() || undefined,
		});
	};

	const todoCount = stats.data?.total || 0;
	const isAtLimit = !hasPro && todoCount >= FREE_TIER_LIMIT;

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<div className="mb-8">
				<h1 className="mb-2 font-bold text-3xl">My Todos</h1>
				<p className="text-muted-foreground">
					Manage your tasks and stay organized
				</p>
			</div>

			{/* Stats */}
			{stats.data && (
				<div className="mb-6 grid grid-cols-3 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Total</CardDescription>
							<CardTitle className="text-2xl">{stats.data.total}</CardTitle>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Completed</CardDescription>
							<CardTitle className="text-2xl">{stats.data.completed}</CardTitle>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Pending</CardDescription>
							<CardTitle className="text-2xl">{stats.data.pending}</CardTitle>
						</CardHeader>
					</Card>
				</div>
			)}

			{/* Tier Limit Warning */}
			{!hasPro && (
				<Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-sm">
							<Badge variant="outline">Free Plan</Badge>
							{todoCount}/{FREE_TIER_LIMIT} todos used
						</CardTitle>
						<CardDescription>
							{isAtLimit
								? "You've reached your free plan limit. Upgrade to Pro for unlimited todos!"
								: `You can create ${FREE_TIER_LIMIT - todoCount} more todos on the free plan.`}
						</CardDescription>
					</CardHeader>
					{isAtLimit && (
						<CardContent>
							<Button
								onClick={() => checkoutEmbed.mutate({ slug: "pro" })}
								size="sm"
							>
								Upgrade to Pro
							</Button>
						</CardContent>
					)}
				</Card>
			)}

			{/* Create Todo Form */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Add New Todo</CardTitle>
					<CardDescription>
						{hasPro
							? "Create unlimited todos with Pro"
							: `Free plan: ${FREE_TIER_LIMIT - todoCount} remaining`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							placeholder="Todo title..."
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							disabled={createTodo.isPending || isAtLimit}
							maxLength={200}
						/>
						<Input
							placeholder="Description (optional)..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={createTodo.isPending || isAtLimit}
							maxLength={1000}
						/>
						<Button
							type="submit"
							disabled={createTodo.isPending || !title.trim() || isAtLimit}
						>
							{createTodo.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<Plus className="mr-2 h-4 w-4" />
									Add Todo
								</>
							)}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Todos List */}
			<div className="space-y-3">
				{todos.isLoading && (
					<div className="py-8 text-center text-muted-foreground">
						<Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
						Loading todos...
					</div>
				)}

				{todos.data && todos.data.length === 0 && (
					<Card>
						<CardContent className="py-12 text-center text-muted-foreground">
							No todos yet. Create your first one above!
						</CardContent>
					</Card>
				)}

				{todos.data?.map((todo) => (
					<Card key={todo.id} className={todo.completed ? "opacity-60" : ""}>
						<CardContent className="p-4">
							<div className="flex items-start gap-3">
								<Checkbox
									id={`todo-${todo.id}`}
									checked={todo.completed}
									onCheckedChange={() => toggleTodo.mutate({ id: todo.id })}
									disabled={toggleTodo.isPending}
									aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
									className="mt-1"
								/>
								<div className="min-w-0 flex-1">
									<h3
										className={`font-medium ${
											todo.completed ? "text-muted-foreground line-through" : ""
										}`}
									>
										{todo.title}
									</h3>
									{todo.description && (
										<p className="mt-1 text-muted-foreground text-sm">
											{todo.description}
										</p>
									)}
									<p className="mt-2 text-muted-foreground text-xs">
										Created {new Date(todo.createdAt).toLocaleDateString()}
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => deleteTodo.mutate({ id: todo.id })}
									disabled={deleteTodo.isPending}
									className="shrink-0"
									aria-label={`Delete "${todo.title}"`}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
