import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, Field } from "../components.jsx";
import { useAuth } from "../context/useAuth.js";
import { api } from "../lib/api.js";
import { ROLE_PATHS } from "../lib/roles.js";

function isStrongPassword(value) {
  return value.length >= 8 && value.length <= 16 && /[A-Z]/.test(value) && /[^A-Za-z0-9]/.test(value);
}

export function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ name: "", email: "", address: "", password: "" });
  const [error, setError] = useState("");
  const notice = location.state?.message || "";
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setValues((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignup) {
        if (!isStrongPassword(values.password)) {
          throw new Error("Use 8–16 characters with at least one uppercase letter and one special character.");
        }
        await api.post("/auth/signup", values);
        navigate("/login", { replace: true, state: { message: "Your account is ready. Sign in to continue." } });
      } else {
        const user = await login(values.email, values.password);
        navigate(ROLE_PATHS[user.role] || "/login", { replace: true });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="mx-auto grid min-h-screen max-w-[1200px] items-center gap-8 px-5 py-8 md:grid-cols-[1fr_0.9fr] md:px-8">
        <section className="relative hidden min-h-[620px] overflow-hidden rounded-2xl bg-navy p-12 text-white shadow-level3 md:flex md:flex-col md:justify-between">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(99,91,255,0.34)_0%,rgba(10,37,64,0)_60%)]" />
          <div className="relative">
            <div className="mb-16 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-lg font-bold">R</span>
              <span className="font-bold tracking-tight">Ratewise</span>
            </div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">A better way to choose</p>
            <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-[-0.03em] lg:text-[52px]">
              Real experiences. Better local businesses.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/70">
              Discover stores, share thoughtful feedback, and help your community make confident decisions.
            </p>
          </div>
          <div className="relative flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/60">
            <span>Trusted reviews for your neighborhood</span>
            <span className="font-mono">01 / 03</span>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[460px] py-8 md:py-0">
          <div className="mb-8 md:hidden">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-primary font-bold text-white">R</span>
              <span className="font-bold text-ink">Ratewise</span>
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{isSignup ? "Join the community" : "Welcome back"}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">{isSignup ? "Create your account" : "Sign in to Ratewise"}</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            {isSignup ? "Create an account to rate the stores you visit." : "Use your account to continue to your workspace."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {notice && <Alert tone="success">{notice}</Alert>}
            {error && <Alert>{error}</Alert>}
            {isSignup && (
              <>
                <Field id="name" label="Full name" name="name" autoComplete="name" required minLength={20} maxLength={60} value={values.name} onChange={updateField} placeholder="At least 20 characters" />
                <Field id="address" label="Address" name="address" autoComplete="street-address" required maxLength={400} value={values.address} onChange={updateField} placeholder="Your address" />
              </>
            )}
            <Field id="email" label="Email address" name="email" type="email" autoComplete="email" required value={values.email} onChange={updateField} placeholder="you@example.com" />
            <Field id="password" label="Password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} required minLength={8} maxLength={16} value={values.password} onChange={updateField} placeholder={isSignup ? "8–16 characters" : "Your password"} />
            {isSignup && <p className="-mt-2 text-xs leading-5 text-muted">Use 8–16 characters, including an uppercase letter and a special character.</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-secondary">
            {isSignup ? "Already have an account?" : "New to Ratewise?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"} className="font-semibold text-primary hover:underline">
              {isSignup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
