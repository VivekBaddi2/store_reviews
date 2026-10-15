import { useEffect, useMemo, useState } from "react";
import { AppShell, EmptyState, ErrorState, LoadingState, PageHeading, Rating, StatCard } from "../components.jsx";
import { api } from "../lib/api.js";

export function OwnerPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    api.get("/store-owner/getAllRatings")
      .then((result) => {
        if (active) {
          setRows(result.data || []);
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

  const stores = useMemo(() => {
    const seen = new Set();
    return rows.filter((row) => {
      if (seen.has(row.store_id)) return false;
      seen.add(row.store_id);
      return true;
    });
  }, [rows]);
  const reviews = useMemo(() => rows.filter((row) => row.review_id), [rows]);
  const overallAverage = useMemo(() => {
    if (!stores.length) return "0.0";
    const total = stores.reduce((sum, store) => sum + Number(store.average_rating || 0), 0);
    return (total / stores.length).toFixed(1);
  }, [stores]);

  return (
    <AppShell>
      <PageHeading
        eyebrow="Store owner"
        title="Your store insights"
        description="See how customers are rating your stores and what they have to say."
      />
      {error && !rows.length ? <ErrorState message={error} onRetry={retryLoad} /> : null}
      {error && rows.length > 0 && <p role="alert" className="mb-4 rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">{error}</p>}
      {loading && !rows.length ? <LoadingState label="Loading store feedback…" /> : null}
      {!loading && !error && stores.length === 0 ? (
        <EmptyState title="No stores are linked to your account" description="Contact an administrator to associate a store with your account." />
      ) : null}
      {stores.length > 0 && (
        <>
          <section className="mb-7 grid gap-4 sm:grid-cols-2">
            <StatCard label="Your stores" value={stores.length} detail="Stores linked to your account" accent />
            <StatCard label="Average store rating" value={overallAverage} detail="Average across your stores" />
          </section>
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold tracking-tight text-ink">Store performance</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {stores.map((store) => {
                const reviewCount = reviews.filter((review) => review.store_id === store.store_id).length;
                return (
                  <article key={store.store_id} className="rounded-xl border border-border bg-white p-5 shadow-level1 md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-ink">{store.store_name}</h3>
                        <p className="mt-1 text-sm text-secondary">{store.store_address}</p>
                      </div>
                      <Rating value={store.average_rating} />
                    </div>
                    <p className="mt-5 border-t border-border pt-4 text-sm text-muted">
                      {reviewCount} {reviewCount === 1 ? "customer has" : "customers have"} shared feedback
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-ink">Customer reviews</h2>
                <p className="mt-1 text-sm text-muted">Ratings and feedback submitted for your stores.</p>
              </div>
              <span className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-secondary">{reviews.length} total</span>
            </div>
            {reviews.length === 0 ? (
              <EmptyState title="No customer reviews yet" description="Reviews submitted for your store will appear here." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-white shadow-level1">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead className="bg-surface">
                      <tr>
                        <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Customer</th>
                        <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Store</th>
                        <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Rating</th>
                        <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reviews.map((review) => (
                        <tr key={review.review_id} className="align-top hover:bg-surface/70">
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-ink">{review.reviewer_name}</p>
                            <p className="mt-1 text-xs text-muted">{review.reviewer_email}</p>
                            <p className="mt-1 max-w-[200px] truncate text-xs text-muted">{review.reviewer_address}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-secondary">{review.store_name}</td>
                          <td className="px-5 py-4"><Rating value={review.ratings} label={`${review.ratings} out of 5 stars`} /></td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-ink">{review.title}</p>
                            {review.description && <p className="mt-1 max-w-sm text-sm leading-5 text-secondary">{review.description}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
