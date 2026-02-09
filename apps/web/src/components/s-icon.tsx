import type { SimpleIcon } from "simple-icons";

interface SimpleIconProps {
	icon: SimpleIcon;
	className?: string;
}

export default function S_Icon({ icon, className }: SimpleIconProps) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			aria-label={icon.title}
		>
			<title>{icon.title}</title>
			<path d={icon.path} fill="currentColor" />
		</svg>
	);
}
