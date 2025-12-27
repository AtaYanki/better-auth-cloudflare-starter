import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export function PaymentPreview() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Monetize. <span className="text-muted-foreground">From day one.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Seamless integration with Polar. Handle subscriptions and invoices with zero friction.
            </p>
          </div>
          <div className="flex justify-center">
            <Card className="w-full max-w-4xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary">P</span>
                    Polar
                    <Badge variant="secondary" className="ml-2">
                      LIVE
                    </Badge>
                  </CardTitle>
                  <CardDescription>Revenue Dashboard</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">$12,450.00</p>
                    <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      +12%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Subs</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">142</p>
                    <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      +8
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">net new</p>
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold">Recent Transactions</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">alex@example.com</TableCell>
                      <TableCell>Pro Plan</TableCell>
                      <TableCell>$49.00</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                          Succeeded
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">sarah@design.co</TableCell>
                      <TableCell>Pro Plan</TableCell>
                      <TableCell>$199.00</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                          Succeeded
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">mike@dev.io</TableCell>
                      <TableCell>Pro Plan</TableCell>
                      <TableCell>$49.00</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                          Processing
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

