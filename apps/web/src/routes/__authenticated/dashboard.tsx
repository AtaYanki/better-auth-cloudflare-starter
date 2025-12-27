import { getUserList } from "@/functions/get-user-list";
import {
  banUser,
  unbanUser,
  deleteUser,
  changeUserRole,
} from "@/functions/user-actions";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import * as React from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  ArrowUpDown,
  Shield,
  ShieldOff,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Users,
  UserPlus,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
};

export const Route = createFileRoute("/__authenticated/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const users = await getUserList();
    return { users };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/auth/$path",
        params: { path: "sign-in" },
      });
    }

    if (context.session.data?.user?.role !== "admin") {
      throw redirect({
        to: "/",
      });
    }
  },
});

function RouteComponent() {
  const { users } = Route.useRouteContext();
  const queryClient = useQueryClient();

  // Calculate user statistics
  const userStats = React.useMemo(() => {
    const userList = (users || []) as User[];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: userList.length,
      active: userList.filter((u) => !u.banned).length,
      banned: userList.filter((u) => u.banned).length,
      verified: userList.filter((u) => u.emailVerified).length,
      unverified: userList.filter((u) => !u.emailVerified).length,
      admins: userList.filter((u) => u.role === "admin").length,
      moderators: userList.filter((u) => u.role === "moderator").length,
      regularUsers: userList.filter((u) => !u.role || u.role === "user").length,
      recent7Days: userList.filter((u) => new Date(u.createdAt) >= sevenDaysAgo)
        .length,
      recent30Days: userList.filter(
        (u) => new Date(u.createdAt) >= thirtyDaysAgo
      ).length,
    };
  }, [users]);

  const banMutation = useMutation({
    mutationFn: banUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User banned successfully");
    },
    onError: () => {
      toast.error("Failed to ban user");
    },
  });

  const unbanMutation = useMutation({
    mutationFn: unbanUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User unbanned successfully");
    },
    onError: () => {
      toast.error("Failed to unban user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: changeUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated successfully");
    },
    onError: () => {
      toast.error("Failed to update user role");
    },
  });

  const handleBanUser = (userId: string) => {
    banMutation.mutate({ data: { userId, banReason: "Banned by admin" } });
  };

  const handleUnbanUser = (userId: string) => {
    unbanMutation.mutate({ data: { userId } });
  };

  const handleDeleteUser = (userId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      deleteMutation.mutate({ data: { userId } });
    }
  };

  const handleChangeRole = (userId: string, role: string) => {
    changeRoleMutation.mutate({
      data: { userId, role: role as "user" | "admin" },
    });
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        if (!role) return <Badge variant="secondary">User</Badge>;

        const roleConfig = {
          admin: { variant: "default" as const, icon: Crown },
          moderator: { variant: "secondary" as const, icon: Shield },
          user: { variant: "outline" as const, icon: UserCheck },
        };

        const config =
          roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
        const Icon = config.icon;

        return (
          <Badge variant={config.variant} className="capitalize">
            <Icon className="mr-1 h-3 w-3" />
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "banned",
      header: "Status",
      cell: ({ row }) => {
        const banned = row.getValue("banned") as boolean;
        return banned ? (
          <Badge variant="destructive">
            <ShieldOff className="mr-1 h-3 w-3" />
            Banned
          </Badge>
        ) : (
          <Badge variant="outline">
            <Shield className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      },
    },
    {
      accessorKey: "emailVerified",
      header: "Verified",
      cell: ({ row }) => {
        const verified = row.getValue("emailVerified") as boolean;
        return verified ? (
          <Badge variant="default">
            <UserCheck className="mr-1 h-3 w-3" />
            Yes
          </Badge>
        ) : (
          <Badge variant="outline">
            <UserX className="mr-1 h-3 w-3" />
            No
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuLabel>Role</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={user.role || "user"}
                onValueChange={(value) => handleChangeRole(user.id, value)}
              >
                <DropdownMenuRadioItem value="user">User</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="moderator">
                  Moderator
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="admin">
                  Admin
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />

              {user.banned ? (
                <DropdownMenuItem
                  onClick={() => handleUnbanUser(user.id)}
                  className="text-green-600"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Unban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleBanUser(user.id)}
                  className="text-orange-600"
                >
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Ban User
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => handleDeleteUser(user.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: (users || []) as User[],
    columns: columns as any,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {users?.length || 0} users total
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.active}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.banned > 0
                ? `${userStats.banned} banned`
                : "All users active"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.verified}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.unverified > 0
                ? `${userStats.unverified} unverified`
                : "All users verified"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Signups
            </CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.recent7Days}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.recent30Days} in last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.admins}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.total > 0
                ? `${Math.round(
                    (userStats.admins / userStats.total) * 100
                  )}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderators</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.moderators}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.total > 0
                ? `${Math.round(
                    (userStats.moderators / userStats.total) * 100
                  )}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.regularUsers}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.total > 0
                ? `${Math.round(
                    (userStats.regularUsers / userStats.total) * 100
                  )}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
