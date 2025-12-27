import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from "@/components/kibo-ui/tree";
import { FileCode, Database, FileText, FolderTree } from "lucide-react";
import { type ReactNode } from "react";
import { FeatureList } from "./feature-list";

type TreeNodeConfig = {
  id: string;
  name: string;
  type: "folder" | "file";
  icon?: ReactNode;
  children?: TreeNodeConfig[];
};

const structure: TreeNodeConfig[] = [
  {
    id: "apps",
    name: "apps/",
    type: "folder",
    children: [
      {
        id: "server",
        name: "server/",
        type: "folder",
        children: [
          {
            id: "server-src",
            name: "src/index.ts",
            type: "file",
            icon: <FileCode className="h-4 w-4" />,
          },
          {
            id: "server-wrangler",
            name: "wrangler.jsonc",
            type: "file",
            icon: <FileCode className="h-4 w-4" />,
          },
        ],
      },
      {
        id: "web",
        name: "web/",
        type: "folder",
        children: [
          {
            id: "web-src",
            name: "src/",
            type: "folder",
            children: [
              {
                id: "web-components",
                name: "components/",
                type: "folder",
              },
              {
                id: "web-routes",
                name: "routes/",
                type: "folder",
              },
              {
                id: "web-lib",
                name: "lib/",
                type: "folder",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "packages",
    name: "packages/",
    type: "folder",
    children: [
      {
        id: "packages-api",
        name: "api/",
        type: "folder",
      },
      {
        id: "packages-auth",
        name: "auth/",
        type: "folder",
      },
      {
        id: "packages-db",
        name: "db/",
        type: "folder",
      },
    ],
  },
];

function renderTreeNode(config: TreeNodeConfig, level: number = 0, isLast: boolean = false): ReactNode {
  const hasChildren = config.children && config.children.length > 0;

  return (
    <TreeNode key={config.id} level={level} nodeId={config.id} isLast={isLast}>
      <TreeNodeTrigger>
        <TreeExpander hasChildren={hasChildren} />
        <TreeIcon hasChildren={hasChildren} icon={config.icon} />
        <TreeLabel>{config.name}</TreeLabel>
      </TreeNodeTrigger>
      {hasChildren && (
        <TreeNodeContent hasChildren>
          {config.children!.map((child, index) =>
            renderTreeNode(child, level + 1, index === config.children!.length - 1)
          )}
        </TreeNodeContent>
      )}
    </TreeNode>
  );
}

const features = [
  {
    title: "Type-safe environment variables",
    description: "Centralized configuration with full TypeScript support",
    icon: <FileText className="h-3 w-3 text-primary" />,
  },
  {
    title: "Centralized database schema",
    description: "Single source of truth for your database structure",
    icon: <Database className="h-3 w-3 text-primary" />,
  },
  {
    title: "File-based routing",
    description: "TanStack Router for intuitive route organization",
    icon: <FolderTree className="h-3 w-3 text-primary" />,
  },
  {
    title: "Monorepo structure",
    description: "Organized packages for API, auth, database, and more",
  },
];

function StructureTree() {
  const defaultExpandedIds = structure.map((node) => node.id);

  return (
    <TreeProvider defaultExpandedIds={defaultExpandedIds} showLines={true} showIcons={true} selectable={false}>
      <TreeView className="font-mono text-sm">
        {structure.map((node, index) => renderTreeNode(node, 0, index === structure.length - 1))}
      </TreeView>
    </TreeProvider>
  );
}

export function CodeStructure() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Structured for <span className="text-muted-foreground">maintainability.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A codebase that actually makes sense. Separation of concerns, type safety everywhere, and zero magic.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <FeatureList features={features} />
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Monorepo architecture</CardTitle>
                <CardDescription>Separated apps (server/web) and shared packages (api/auth/db)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-4">
                  <StructureTree />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

