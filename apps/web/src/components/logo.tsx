import { Link } from "@tanstack/react-router";

export default function Logo() {
	return (
		<Link to="/" className="group flex items-center">
			<img
				src={"/favicon.png"}
				alt="logo"
				className="size-10 object-contain transition-opacity group-hover:opacity-75"
			/>
		</Link>
	);
}
