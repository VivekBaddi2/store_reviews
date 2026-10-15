import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/useAuth.js";
import { ROLE_PATHS } from "./lib/roles.js";

export function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_PATHS[user.role] || "/login"} replace />;
  }
  return children;
}

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:px-8">
          <Link to={ROLE_PATHS[user.role] || "/login"} className="flex items-center gap-3" aria-label="Ratewise home">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-lg font-bold text-white shadow-sm">R</span>
            <span className="text-base font-bold tracking-tight text-ink">Ratewise</span>
          </Link>
          <nav className="flex items-center gap-3" aria-label="Account">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-semibold text-ink">{user.name}</span>
              <span className="block text-xs text-muted">{user.role}</span>
            </span>
            <Link
              to="/password"
              className="rounded-md px-3 py-2 text-sm font-medium text-secondary hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Password
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-8 md:py-10">{children}</main>
    </div>
  );
}

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight text-ink md:text-[40px] md:leading-[1.2]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary md:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, detail, accent = false }) {
  return (
    <article className={`rounded-xl border p-5 shadow-level1 ${accent ? "border-transparent bg-navy text-white" : "border-border bg-white"}`}>
      <p className={`text-sm font-medium ${accent ? "text-white/70" : "text-muted"}`}>{label}</p>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${accent ? "text-white" : "text-ink"}`}>{value}</p>
      {detail && <p className={`mt-1 text-xs ${accent ? "text-white/60" : "text-muted"}`}>{detail}</p>}
    </article>
  );
}

export function Alert({ children, tone = "error" }) {
  const styles = {
    error: "border-error/20 bg-error/5 text-error",
    success: "border-success/20 bg-success/5 text-success",
    info: "border-primary/20 bg-primary/5 text-secondary",
  };
  return <div role={tone === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${styles[tone]}`}>{children}</div>;
}

export function Field({ label, id, error, className = "", ...inputProps }) {
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10 ${error ? "border-error" : "border-border"}`}
        {...inputProps}
      />
      {error && <span id={`${id}-error`} className="mt-1 block text-xs text-error">{error}</span>}
    </label>
  );
}

export function SelectField({ label, id, children, className = "", ...selectProps }) {
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      <select
        id={id}
        className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        {...selectProps}
      >
        {children}
      </select>
    </label>
  );
}

export function LoadingState({ label = "Loading your workspace…" }) {
  return <div className="rounded-xl border border-border bg-white px-6 py-12 text-center text-sm text-muted" role="status">{label}</div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-error/20 bg-white px-6 py-10 text-center">
      <p className="font-semibold text-ink">We couldn’t load this page</p>
      <p className="mt-2 text-sm text-secondary">{message}</p>
      <button type="button" onClick={onRetry} className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Try again</button>
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white px-6 py-12 text-center">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}

export function Rating({ value, label }) {
  const rating = Number(value);
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={label || `${rating.toFixed(1)} out of 5 stars`}>
      <span aria-hidden="true" className="tracking-[0.08em] text-warning">{"★".repeat(Math.max(0, Math.min(5, Math.round(rating))))}{"☆".repeat(5 - Math.max(0, Math.min(5, Math.round(rating))))}</span>
      <span className="text-sm font-semibold text-ink">{Number.isFinite(rating) ? rating.toFixed(1) : "0.0"}</span>
    </span>
  );
}
