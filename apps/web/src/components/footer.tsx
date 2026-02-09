import { siGithub, siX } from "simple-icons";
import Logo from "@/components/logo";
import S_Icon from "@/components/s-icon";

export default function Footer() {
	return (
		<footer className="border-t bg-background py-8">
			<div className="container mx-auto px-4">
				<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
					<div className="flex items-center gap-4">
						<Logo />
						<span className="text-muted-foreground text-sm">
							Better Auth Cloudflare Starter • 2025 - All rights reserved.
						</span>
					</div>
					<div className="flex items-center gap-4">
						<a
							href="https://github.com/atayanki/better-auth-cloudflare-starter"
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground transition-colors hover:text-foreground"
						>
							<S_Icon icon={siGithub} className="h-5 w-5" />
						</a>
						<a
							href="https://twitter.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground transition-colors hover:text-foreground"
						>
							<S_Icon icon={siX} className="h-5 w-5" />
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
