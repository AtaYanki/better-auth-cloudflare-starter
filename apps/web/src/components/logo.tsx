import { Link } from "@tanstack/react-router";

export default function Logo() {
  return (
    <div className="flex justify-center">
      <Link to="/" className="flex items-center">
        <img
          src={"/favicon.png"}
          alt="logo"
          className="size-10 object-contain hover:opacity-75 transition-all"
        />
      </Link>
    </div>
  );
}
