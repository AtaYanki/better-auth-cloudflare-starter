import { Link } from "@tanstack/react-router";

export default function Logo() {
  return (
    <Link to="/" className="flex items-center group">
      <img
        src={"/favicon.png"}
        alt="logo"
        className="size-10 object-contain group-hover:opacity-75 transition-opacity"
      />
    </Link>
  );
}
