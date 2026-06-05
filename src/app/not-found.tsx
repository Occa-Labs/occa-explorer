import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-5 py-32 text-center">
      <span className="badge badge-amber">404</span>
      <h1 className="mt-5 text-2xl font-semibold">Not found on chain</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        No company, agent, or invoice matches that address. It may not be
        anchored yet, or the PDA is malformed.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90"
      >
        Back to Explorer
      </Link>
    </div>
  );
}
