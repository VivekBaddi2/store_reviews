import { useEffect, useMemo, useState } from "react";
import { Alert, AppShell, EmptyState, ErrorState, Field, LoadingState, PageHeading, Rating, SelectField, StatCard } from "../components.jsx";
import { api } from "../lib/api.js";

const ROLES = ["System Administrator", "Normal User", "Store Owner"];

function matchesSearch(row, fields, query) {
  const value = query.trim().toLowerCase();
  return !value || fields.some((field) => String(row[field] ?? "").toLowerCase().includes(value));
}

function DataTable({ rows, columns, searchFields, search, emptyMessage, totalCount }) {
  const [sort, setSort] = useState({ key: columns[0]?.key, direction: "asc" });
  const filtered = useMemo(
    () => rows.filter((row) => matchesSearch(row, searchFields, search)),
    [rows, searchFields, search]
  );
  const sorted = useMemo(() => [...filtered].sort((left, right) => {
    const a = left[sort.key];
    const b = right[sort.key];
    const comparison = typeof a === "number" || typeof b === "number"
      ? Number(a || 0) - Number(b || 0)
      : String(a ?? "").localeCompare(String(b ?? ""), undefined, { sensitivity: "base", numeric: true });
    return sort.direction === "asc" ? comparison : -comparison;
  }), [filtered, sort]);

  if (!sorted.length) {
    return <EmptyState title="No matching records" description={emptyMessage} />;
  }

  function toggleSort(key) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-level1">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="bg-surface">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  <button type="button" onClick={() => toggleSort(column.key)} className="inline-flex items-center gap-1.5 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary">
                    {column.label}
                    <span aria-hidden="true">{sort.key === column.key ? sort.direction === "asc" ? "↑" : "↓" : "↕"}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((row, index) => (
              <tr key={row.user_id || row.store_id || row.review_id || index} className="hover:bg-surface/70">
                {columns.map((column) => <td key={column.key} className="px-5 py-4 text-sm text-secondary">{column.render ? column.render(row) : row[column.key] || "—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border bg-white px-5 py-3 text-xs text-muted">Showing {sorted.length} of {totalCount} records</div>
    </div>
  );
}

function isStrongPassword(value) {
  return value.length >= 8 && value.length <= 16 && /[A-Z]/.test(value) && /[^A-Za-z0-9]/.test(value);
}

export function AdminPage() {
  const [data, setData] = useState({ users: [], stores: [], ratings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("stores");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formMode, setFormMode] = useState("");
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", address: "", password: "", role: "Normal User" });
  const [storeForm, setStoreForm] = useState({ name: "", address: "", user_id: "" });

  useEffect(() => {
    let active = true;
    Promise.all([
        api.get("/system-admin/getAllUsers"),
        api.get("/system-admin/getAllStores"),
        api.get("/system-admin/getAllRatings"),
    ])
      .then(([users, stores, ratings]) => {
        if (active) {
          setData({ users: users.data || [], stores: stores.data || [], ratings: ratings.data || [] });
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [refreshKey]);

  function retryLoad() {
    setLoading(true);
    setError("");
    setRefreshKey((value) => value + 1);
  }

  const visibleUsers = useMemo(
    () => data.users.filter((user) => (roleFilter === "all" || user.role === roleFilter) &&
      matchesSearch(user, ["name", "email", "address", "role"], search)),
    [data.users, roleFilter, search]
  );
  const visibleStores = useMemo(
    () => data.stores.filter((store) => matchesSearch(store, ["name", "email", "owner_name", "address"], search)),
    [data.stores, search]
  );
  const visibleRatings = useMemo(
    () => data.ratings.filter((review) => matchesSearch(review, ["store_name", "reviewer_name", "reviewer_email", "title", "description"], search)),
    [data.ratings, search]
  );
  const storeOwners = useMemo(() => data.users.filter((user) => user.role === "Store Owner"), [data.users]);

  async function submitUser(event) {
    event.preventDefault();
    setFormError("");
    setNotice("");
    if (!isStrongPassword(userForm.password)) {
      setFormError("Password must be 8–16 characters with an uppercase letter and a special character.");
      return;
    }
    setSaving(true);
    try {
      const result = await api.post("/system-admin/createUser", userForm);
      setNotice(result.message);
      setUserForm({ name: "", email: "", address: "", password: "", role: "Normal User" });
      setFormMode("");
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function submitStore(event) {
    event.preventDefault();
    setFormError("");
    setNotice("");
    setSaving(true);
    try {
      const result = await api.post("/system-admin/createStore", storeForm);
      setNotice(result.message);
      setStoreForm({ name: "", address: "", user_id: "" });
      setFormMode("");
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: "stores", label: "Stores", count: data.stores.length },
    { id: "users", label: "Users", count: data.users.length },
    { id: "ratings", label: "Ratings", count: data.ratings.length },
  ];

  const userColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "role", label: "Role" },
    { key: "average_rating", label: "Owner rating", render: (row) => row.role === "Store Owner" ? <Rating value={row.average_rating} /> : "—" },
  ];
  const storeColumns = [
    { key: "name", label: "Store name" },
    { key: "email", label: "Owner email" },
    { key: "address", label: "Address" },
    { key: "average_rating", label: "Rating", render: (row) => <Rating value={row.average_rating} /> },
    { key: "ratings_count", label: "Reviews" },
  ];
  const ratingColumns = [
    { key: "store_name", label: "Store" },
    { key: "reviewer_name", label: "Reviewer" },
    { key: "reviewer_email", label: "Email" },
    { key: "ratings", label: "Rating", render: (row) => <Rating value={row.ratings} /> },
    { key: "title", label: "Review" },
  ];

  return (
    <AppShell>
      <PageHeading
        eyebrow="System administrator"
        title="Platform overview"
        description="Monitor your community and manage stores, users, and ratings."
        action={
          <div className="flex gap-2">
            <button type="button" onClick={() => { setFormMode(formMode === "user" ? "" : "user"); setFormError(""); }} className="rounded-md border border-border bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Add user</button>
            <button type="button" onClick={() => { setFormMode(formMode === "store" ? "" : "store"); setFormError(""); }} className="rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Add store</button>
          </div>
        }
      />

      {notice && <div className="mb-5"><Alert tone="success">{notice}</Alert></div>}
      {formMode && (
        <section className="mb-7 rounded-xl border border-border bg-white p-5 shadow-level1 md:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">{formMode === "user" ? "Create a user" : "Register a store"}</h2>
              <p className="mt-1 text-sm text-muted">{formMode === "user" ? "Create a normal user, store owner, or administrator." : "Connect a new store to an existing store owner."}</p>
            </div>
            <button type="button" onClick={() => { setFormMode(""); setFormError(""); }} className="rounded-md px-2 py-1 text-sm font-medium text-muted hover:bg-surface hover:text-ink">Close</button>
          </div>
          {formError && <div className="mb-4"><Alert>{formError}</Alert></div>}
          {formMode === "user" ? (
            <form onSubmit={submitUser} className="grid gap-4 md:grid-cols-2">
              <Field id="admin-user-name" label="Full name" required minLength={20} maxLength={60} value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} />
              <Field id="admin-user-email" label="Email address" type="email" required value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} />
              <Field id="admin-user-address" label="Address" required maxLength={400} value={userForm.address} onChange={(event) => setUserForm({ ...userForm, address: event.target.value })} />
              <Field id="admin-user-password" label="Temporary password" type="password" required minLength={8} maxLength={16} value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} />
              <SelectField id="admin-user-role" label="Role" value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
                {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
              </SelectField>
              <div className="flex items-end">
                <button disabled={saving} className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">{saving ? "Creating…" : "Create user"}</button>
              </div>
              <p className="text-xs text-muted md:col-span-2">Password must be 8–16 characters and include an uppercase letter and a special character.</p>
            </form>
          ) : (
            <form onSubmit={submitStore} className="grid gap-4 md:grid-cols-2">
              <Field id="store-name" label="Store name" required maxLength={120} value={storeForm.name} onChange={(event) => setStoreForm({ ...storeForm, name: event.target.value })} />
              <Field id="store-address" label="Address" required maxLength={400} value={storeForm.address} onChange={(event) => setStoreForm({ ...storeForm, address: event.target.value })} />
              <SelectField id="store-owner" label="Store owner" required value={storeForm.user_id} onChange={(event) => setStoreForm({ ...storeForm, user_id: event.target.value })}>
                <option value="">Select an owner</option>
                {storeOwners.map((owner) => <option key={owner.user_id} value={owner.user_id}>{owner.name} · {owner.email}</option>)}
              </SelectField>
              <div className="flex items-end">
                <button disabled={saving || !storeOwners.length} className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">{saving ? "Registering…" : "Register store"}</button>
              </div>
              {!storeOwners.length && <p className="text-xs text-muted md:col-span-2">Create a user with the Store Owner role before registering a store.</p>}
            </form>
          )}
        </section>
      )}

      {error && !data.users.length && !data.stores.length ? <ErrorState message={error} onRetry={retryLoad} /> : null}
      {error && (data.users.length || data.stores.length) ? <div className="mb-5"><Alert>{error}</Alert></div> : null}
      {loading && !data.users.length && !data.stores.length ? <LoadingState label="Loading platform data…" /> : null}

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={data.users.length} detail="Registered platform accounts" accent />
        <StatCard label="Total stores" value={data.stores.length} detail="Businesses in the directory" />
        <StatCard label="Submitted ratings" value={data.ratings.length} detail="Community reviews" />
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">Platform records</h2>
            <p className="mt-1 text-sm text-muted">Search and sort your directory and user records.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field id="admin-search" label="Search records" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, or address" className="w-full sm:w-64" />
            {activeTab === "users" && (
              <SelectField id="role-filter" label="Filter by role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="w-full sm:w-52">
                <option value="all">All roles</option>
                {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
              </SelectField>
            )}
          </div>
        </div>
        <div className="mb-4 flex gap-2 overflow-x-auto border-b border-border" role="tablist" aria-label="Platform data">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => { setActiveTab(tab.id); setSearch(""); }} className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-primary ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
              {tab.label} <span className="ml-1 rounded-full bg-surface px-2 py-0.5 text-xs text-secondary">{tab.count}</span>
            </button>
          ))}
        </div>
        {loading && !data.users.length && !data.stores.length ? null : activeTab === "users" ? (
          <DataTable key={activeTab} rows={visibleUsers} columns={userColumns} searchFields={["name", "email", "address", "role"]} search="" emptyMessage="Adjust your search or role filter." totalCount={data.users.length} />
        ) : activeTab === "stores" ? (
          <DataTable key={activeTab} rows={visibleStores} columns={storeColumns} searchFields={["name", "email", "owner_name", "address"]} search="" emptyMessage="Adjust your search to find a store." totalCount={data.stores.length} />
        ) : (
          <DataTable key={activeTab} rows={visibleRatings} columns={ratingColumns} searchFields={["store_name", "reviewer_name", "reviewer_email", "title", "description"]} search="" emptyMessage="Ratings submitted by customers will appear here." totalCount={data.ratings.length} />
        )}
      </section>
    </AppShell>
  );
}
