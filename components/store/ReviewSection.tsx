"use client";

import { FormEvent, useEffect, useState } from "react";
import { Star } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
};

type Props = {
  productId: string;
  isAuthenticated: boolean;
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`transition ${onChange ? "cursor-pointer" : "cursor-default"}`}
          aria-label={`${star} star`}
        >
          <Star
            size={18}
            className={
              star <= (hovered || value)
                ? "fill-studio-accent text-studio-accent"
                : "fill-studio-light text-studio-primary/25"
            }
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ productId, isAuthenticated }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function loadReviews() {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = (await res.json()) as Review[];
        setReviews(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: comment.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? "Something went wrong.");
      } else {
        setSubmitted(true);
        setComment("");
        setRating(5);
        await loadReviews();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-studio-primary">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="mt-1 flex items-center gap-2">
              <StarRating value={Math.round(avgRating)} />
              <span className="text-sm text-studio-ink/65">
                {avgRating.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Write a review */}
      {isAuthenticated ? (
        <div className="mt-5 rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_28px_-24px_rgba(63,52,143,0.45)]">
          <p className="text-sm font-semibold text-studio-primary">Write a Review</p>
          {submitted ? (
            <p className="mt-3 text-sm text-green-700">
              Thank you for your review! It has been saved.{" "}
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="underline"
              >
                Edit
              </button>
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-ink/55">
                  Rating
                </span>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product… (optional)"
                rows={3}
                maxLength={1000}
                className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm text-studio-ink outline-none transition focus:border-studio-accent"
              />
              {error ? <p className="text-xs text-red-600">{error}</p> : null}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-studio-ink/65">
          <a href="/login" className="font-semibold text-studio-accent underline underline-offset-2">
            Log in
          </a>{" "}
          to leave a review.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="mt-6 text-sm text-studio-ink/50">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-studio-primary/15 bg-white p-5 text-sm text-studio-ink/55">
          No reviews yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_12px_24px_-18px_rgba(63,52,143,0.4)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-studio-ink">{review.user.name}</p>
                  <p className="text-xs text-studio-ink/45">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StarRating value={review.rating} />
              </div>
              {review.comment ? (
                <p className="mt-2 text-sm text-studio-ink/80">{review.comment}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
