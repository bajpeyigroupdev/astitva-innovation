import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
    <section className="max-w-lg text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        That dashboard address does not match an available page.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Return to overview
      </Link>
    </section>
  </main>
);

export default NotFoundPage;
