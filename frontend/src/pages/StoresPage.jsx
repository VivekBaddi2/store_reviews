import { useEffect, useMemo, useState } from "react";
import { Alert, AppShell, EmptyState, ErrorState, Field, LoadingState, PageHeading, Rating } from "../components.jsx";
import { api } from "../lib/api.js";

function StoreCard({ store, onSaved }) {
  const [savedRating, setSavedRating] = useState(Number(store.user_rating) || 0);
  const [rating, setRating] = useState(Number(store.user_rating) || 5);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveRating(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/normal-user/submitRating", {
        store_id: store.store_id,
        ratings: rating,
        title: "Store rating",
        description,
      });
      setSavedRating(rating);
      setDescription("");
      await onSaved();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="flex flex-col rounded-xl border border-border bg-white p-5 shadow-level1 transition duration-200 hover:shadow-level2 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">{store.name}</h2>
          <p className="mt-1 text-sm leading-5 text-secondary">{store.address}</p>
          {store.owner_email && <p className="mt-2 text-xs text-muted">Store contact · {store.owner_email}</p>}
        </div>
        <span className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-secondary">
          {Number(store.ratings_count) || 0} {Number(store.ratings_count) === 1 ? "review" : "reviews"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
        <div>
          <p className="mb-1 text-xs text-muted">Overall rating</p>
          <Rating value={store.average_rating} />
        </div>
        <div className="text-right">
          <p className="mb-1 text-xs text-muted">Your rating</p>
          {savedRating ? <Rating value={savedRating} label={`Your rating: ${savedRating} out of 5`} /> : <span className="text-sm text-muted">Not rated yet</span>}
        </div>
      </div>

      <form onSubmit={saveRating} className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-semibold text-ink" htmlFor={`rating-${store.store_id}`}>
            {savedRating ? "Update your rating" : "Rate this store"}
          </label>
          <div id={`rating-${store.store_id}`} className="flex gap-1" role="group" aria-label={`Your rating for ${store.name}`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-pressed={rating === star}
                aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                onClick={() => setRating(star)}
                className={`grid size-9 place-items-center rounded-md text-xl transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${star <= rating ? "text-warning" : "text-border hover:text-warning/70"}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <label htmlFor={`review-${store.store_id}`} className="sr-only">Optional review for {store.name}</label>
        <textarea
          id={`review-${store.store_id}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={400}
          rows={2}
          placeholder="Add a note about your experience (optional)"
          className="mt-3 w-full resize-y rounded-md border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
        <button type="submit" disabled={saving} className="mt-3 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? "Saving…" : savedRating ? "Save updated rating" : "Submit rating"}
        </button>
      </form>
    </article>
  );
}

export function StoresPage() {
  const [stores, setStores] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    api.get("/normal-user/getAllStores")
      .then((result) => {
        if (active) {
          setStores(result.data || []);
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

  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return stores.filter((store) =>
      `${store.name} ${store.address}`.toLowerCase().includes(normalizedQuery)
    );
  }, [stores, query]);

  return (
    <AppShell>
      <PageHeading
        eyebrow="Discover & review"
        title="Find your next favorite"
        description="Explore stores in your community and share a rating based on your experience."
        action={<div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-secondary"><span className="font-semibold text-primary">Your voice matters.</span> Ratings help everyone shop smarter.</div>}
      />
      <section className="mb-6 rounded-xl border border-border bg-white p-4 shadow-level1 md:p-5">
        <Field
          id="store-search"
          label="Search stores"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by store name or address"
        />
      </section>
      {error && !stores.length ? <ErrorState message={error} onRetry={retryLoad} /> : null}
      {error && stores.length > 0 && <Alert>{error}</Alert>}
      {loading && !stores.length ? <LoadingState label="Loading local stores…" /> : null}
      {!loading && !error && filteredStores.length === 0 ? (
        <EmptyState
          title={query ? "No stores match that search" : "No stores available yet"}
          description={query ? "Try a different name or address." : "Check back soon as more stores join the community."}
        />
      ) : null}
      {filteredStores.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredStores.map((store) => (
            <StoreCard
              key={store.store_id}
              store={store}
              onSaved={retryLoad}
            />
          ))}
        </div>
      )}
      {loading && stores.length > 0 && <p className="mt-4 text-center text-xs text-muted">Refreshing store ratings…</p>}
    </AppShell>
  );
}
