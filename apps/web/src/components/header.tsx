import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { POLAR_PRODUCTS, isProduct } from "@/lib/polar-products";
import { OrganizationSwitcher } from "@daveyplate/better-auth-ui";
import {
  LineChart,
  LogOut,
  Settings,
  Sparkles,
  CheckSquare,
} from "lucide-react";
import { useCustomerState, useCheckoutEmbed } from "@/hooks/use-polar";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const navigationLinks: { href: string; label: string; isExternal: boolean }[] =
  [
    // { href: "/", label: "Home", isExternal: false },
    // { href: "/about", label: "About", isExternal: false }
  ];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutEmbed = useCheckoutEmbed();
  const { isScrolled } = useScrollPosition();
  const { data: session } = authClient.useSession();
  const { data: customerState } = useCustomerState({ enabled: !!session });

  // Check if user has active Pro subscription
  const hasPro = customerState
    ? customerState.activeSubscriptions?.some((sub) =>
        isProduct(sub.productId, "pro")
      )
    : false;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex w-full justify-center transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/50"
          : "bg-background/50 backdrop-blur-sm border-b border-border/20"
      )}
    >
      <div className="flex h-16 w-full items-center justify-between gap-4 container px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-36 p-1 md:hidden bg-background/95 backdrop-blur-md border-border/50"
            >
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      <NavigationMenuLink
                        href={link.href}
                        className="py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        active={location.pathname === link.href}
                        target={link.isExternal ? "_blank" : undefined}
                        rel={
                          link.isExternal ? "noopener noreferrer" : undefined
                        }
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Logo />
            {session && (
              <OrganizationSwitcher
                size="sm"
                className={cn(
                  "transition-colors",
                  isScrolled
                    ? "bg-background/80 text-foreground hover:bg-background/90"
                    : "bg-background/30 text-foreground hover:bg-background/50"
                )}
              />
            )}
            {/* Navigation menu */}
            <NavigationMenu className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink
                      active={location.pathname === link.href}
                      href={link.href}
                      target={link.isExternal ? "_blank" : undefined}
                      rel={link.isExternal ? "noopener noreferrer" : undefined}
                      className="text-muted-foreground hover:text-foreground py-1.5 font-medium transition-colors"
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-8 h-8"
                >
                  <Avatar className="rounded-sm">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md bg-background/95 backdrop-blur-md border-border/50"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar>
                      <AvatarImage src={session.user.image ?? undefined} />
                      <AvatarFallback>
                        {session.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-foreground">
                        {session.user.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {session.user.role === "admin" && (
                    <Link to="/dashboard">
                      <DropdownMenuItem>
                        <LineChart />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {!hasPro && (
                    <DropdownMenuItem
                      onClick={() =>
                        checkoutEmbed.mutate({
                          productId: POLAR_PRODUCTS.pro.id,
                          slug: POLAR_PRODUCTS.pro.slug,
                        })
                      }
                    >
                      <Sparkles />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  )}
                  <Link to="/todos">
                    <DropdownMenuItem>
                      <CheckSquare />
                      Todos
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/account/$path" params={{ path: "settings" }}>
                    <DropdownMenuItem>
                      <Settings />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          navigate({
                            to: "/",
                          });
                        },
                      },
                    })
                  }
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              variant={isScrolled ? "default" : "outline"}
              className={cn(
                isScrolled
                  ? ""
                  : "border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80"
              )}
            >
              <Link to="/auth/$path" params={{ path: "sign-in" }}>
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
