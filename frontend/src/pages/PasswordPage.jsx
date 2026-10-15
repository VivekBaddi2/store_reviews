import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, AppShell, Field, PageHeading } from "../components.jsx";
import { useAuth } from "../context/useAuth.js";
import { ROLE_PATHS } from "../lib/roles.js";
import { api } from "../lib/api.js";

function isStrongPassword(value) {
  return value.length >= 8 && value.length <= 16 && /[A-Z]/.test(value) && /[^A-Za-z0-9]/.test(value);
}

export function PasswordPage() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!isStrongPassword(password)) {
      setError("Use 8–16 characters with at least one uppercase letter and one special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const result = await api.post("/auth/updatePassword", { newPassword: password });
      setSuccess(result.message);
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeading eyebrow="Account settings" title="Update password" description="Choose a strong password to keep your account secure." />
      <section className="max-w-xl rounded-xl border border-border bg-white p-6 shadow-level1 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert>{error}</Alert>}
          {success && <Alert tone="success">{success}</Alert>}
          <Field id="new-password" label="New password" type="password" autoComplete="new-password" required minLength={8} maxLength={16} value={password} onChange={(event) => setPassword(event.target.value)} />
          <Field id="confirm-password" label="Confirm new password" type="password" autoComplete="new-password" required minLength={8} maxLength={16} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          <p className="text-xs leading-5 text-muted">8–16 characters, with at least one uppercase letter and one special character.</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50">
              {saving ? "Saving…" : "Update password"}
            </button>
            <Link to={ROLE_PATHS[user.role]} className="rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              Back to dashboard
            </Link>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
