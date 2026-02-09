import { OrganizationSwitcher } from "@daveyplate/better-auth-ui";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
	CheckSquare,
	LineChart,
	LogOut,
	Settings,
	Sparkles,
} from "lucide-react";
import Logo from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useCheckoutEmbed, useCustomerState } from "@/hooks/use-polar";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { authClient } from "@/lib/auth-client";
import { isProduct, POLAR_PRODUCTS } from "@/lib/polar-products";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
				isProduct(sub.productId, "pro"),
			)
		: false;

	return (
		<header
			className={cn(
				"sticky top-0 z-50 flex w-full justify-center transition-all duration-300",
				isScrolled
					? "border-border/50 border-b bg-background/95 backdrop-blur-md"
					: "border-border/20 border-b bg-background/50 backdrop-blur-sm",
			)}
		>
			<div className="container flex h-16 w-full items-center justify-between gap-4 px-4 md:px-6">
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
									<title>Menu</title>
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
							className="w-36 border-border/50 bg-background/95 p-1 backdrop-blur-md md:hidden"
						>
							<NavigationMenu className="max-w-none *:w-full">
								<NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
									{navigationLinks.map((link, index) => (
										<NavigationMenuItem
											key={index.toString()}
											className="w-full"
										>
											<NavigationMenuLink
												href={link.href}
												className="py-1.5 text-muted-foreground transition-colors hover:text-foreground"
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
										: "bg-background/30 text-foreground hover:bg-background/50",
								)}
							/>
						)}
						{/* Navigation menu */}
						<NavigationMenu className="max-md:hidden">
							<NavigationMenuList className="gap-2">
								{navigationLinks.map((link, index) => (
									<NavigationMenuItem key={index.toString()}>
										<NavigationMenuLink
											active={location.pathname === link.href}
											href={link.href}
											target={link.isExternal ? "_blank" : undefined}
											rel={link.isExternal ? "noopener noreferrer" : undefined}
											className="py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
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
									className="h-8 w-8 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
								className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md border-border/50 bg-background/95 backdrop-blur-md"
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
											<span className="truncate text-muted-foreground text-xs">
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
									: "border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80",
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
