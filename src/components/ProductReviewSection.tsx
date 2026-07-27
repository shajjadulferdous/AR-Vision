"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { reviewApi } from "@/lib/api";
import { Star, MessageSquareText, Send, UserCircle2, LogIn } from "lucide-react";

type ReviewItem = {
    reviewId: number | string;
    productId?: number;
    customerId?: number;
    customerName: string;
    rating: number;
    comment: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    ownedByCurrentCustomer?: boolean;
};

type ReviewSummary = {
    averageRating: number;
    totalReviews: number;
    breakdown: { star: number; count: number }[];
};

type ProductReviewSectionProps = {
    productId: number;
    productName: string;
    isCustomer: boolean;
};

const DEFAULT_BREAKDOWN = [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 }));

function unwrapResponse(payload: any) {
    return payload?.data?.data ?? payload?.data ?? payload ?? null;
}

function computeSummaryFromReviews(reviews: ReviewItem[]): ReviewSummary {
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;
    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((review) => review.rating === star).length,
    }));

    return {
        averageRating,
        totalReviews,
        breakdown: breakdown.some((item) => item.count > 0) || totalReviews > 0 ? breakdown : DEFAULT_BREAKDOWN,
    };
}

function mergeCurrentReview(reviews: ReviewItem[], currentReview: ReviewItem | null) {
    if (!currentReview) return reviews;

    const currentReviewId = String(currentReview.reviewId);
    const filtered = reviews.filter((review) => String(review.reviewId) !== currentReviewId);
    return [currentReview, ...filtered];
}

function normalizeReviews(payload: any): ReviewItem[] {
    const data = unwrapResponse(payload);
    const list = Array.isArray(data) ? data : data?.content ?? data?.reviews ?? [];

    return list.map((item: any, index: number) => ({
        reviewId: item.reviewId ?? item.id ?? `${index}-${item.createdAt ?? "review"}`,
        productId: item.productId ?? undefined,
        customerId: item.customerId ?? undefined,
        customerName: item.customerName ?? item.userName ?? item.name ?? item.customer?.name ?? "Customer",
        rating: Number(item.rating ?? item.stars ?? item.score ?? 0),
        comment: item.comment ?? item.reviewText ?? item.message ?? "",
        createdAt: item.createdAt ?? item.reviewedAt ?? item.date ?? null,
        updatedAt: item.updatedAt ?? null,
        ownedByCurrentCustomer: Boolean(item.ownedByCurrentCustomer),
    }));
}

function normalizeSummary(payload: any, reviews: ReviewItem[]): ReviewSummary {
    const data = unwrapResponse(payload);
    const totalReviews = Number(
        data?.totalReviews ?? data?.reviewCount ?? data?.count ?? reviews.length
    );
    const averageRating = Number(
        data?.averageRating ?? data?.avgRating ?? data?.rating ?? (reviews.length
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0)
    );
    const distribution = data?.distribution ?? data?.ratingBreakdown ?? data?.ratingDistribution ?? data?.counts ?? {};

    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: Number(distribution[star] ?? distribution[String(star)] ?? distribution[`star${star}`] ?? 0),
    }));

    return {
        averageRating,
        totalReviews,
        breakdown: breakdown.some((item) => item.count > 0) || totalReviews > 0 ? breakdown : DEFAULT_BREAKDOWN,
    };
}

function formatDate(value?: string | null) {
    if (!value) return "Recently";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Recently";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(parsed);
}

function StarDisplay({ value, interactive = false, onSelect }: { value: number; interactive?: boolean; onSelect?: (rating: number) => void; }) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
                const starValue = index + 1;
                const filled = starValue <= value;
                const icon = (
                    <Star
                        key={starValue}
                        size={interactive ? 22 : 16}
                        className={filled ? "text-amber-400" : "text-gray-300"}
                        fill={filled ? "currentColor" : "none"}
                    />
                );

                if (!interactive) return icon;

                return (
                    <button
                        key={starValue}
                        type="button"
                        onClick={() => onSelect?.(starValue)}
                        className="transition-transform hover:scale-110"
                        aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                    >
                        {icon}
                    </button>
                );
            })}
        </div>
    );
}

export default function ProductReviewSection({ productId, productName, isCustomer }: ProductReviewSectionProps) {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [summary, setSummary] = useState<ReviewSummary>({ averageRating: 0, totalReviews: 0, breakdown: DEFAULT_BREAKDOWN });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingReviewId, setDeletingReviewId] = useState<number | string | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [myReviewId, setMyReviewId] = useState<number | string | null>(null);
    const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const applyVisibleState = (baseReviews: ReviewItem[], currentReview: ReviewItem | null, summaryPayload: any) => {
        const mergedReviews = mergeCurrentReview(baseReviews, currentReview);
        const nextSummary = normalizeSummary(summaryPayload, mergedReviews);
        const hasRealSummary = nextSummary.totalReviews > 0 || nextSummary.averageRating > 0 || nextSummary.breakdown.some((row) => row.count > 0);

        setReviews(mergedReviews);
        setSummary(hasRealSummary ? nextSummary : computeSummaryFromReviews(mergedReviews));

        if (currentReview) {
            setMyReviewId(currentReview.reviewId);
            setRating(Number(currentReview.rating ?? 0));
            setComment(String(currentReview.comment ?? ""));
        } else {
            setMyReviewId(null);
            setRating(0);
            setComment("");
        }
    };

    const loadReviews = useCallback(async () => {
        setLoading(true);
        setNotice(null);

        const requests = [
            reviewApi.getByProductId(productId, { page: 0, size: 20, sortDir: "desc" }),
            reviewApi.getSummary(productId),
        ];

        if (isCustomer) {
            requests.push(reviewApi.getMyReview(productId));
        }

        const [reviewsResult, summaryResult, myReviewResult] = await Promise.allSettled(requests);

        const nextReviews = reviewsResult.status === "fulfilled" ? normalizeReviews(reviewsResult.value) : [];
        const nextSummary = summaryResult.status === "fulfilled"
            ? summaryResult.value
            : null;

        const currentReview = myReviewResult && myReviewResult.status === "fulfilled"
            ? normalizeReviews([unwrapResponse(myReviewResult.value)])[0] ?? null
            : null;

        applyVisibleState(nextReviews, currentReview, nextSummary);
        setLoading(false);
    }, [isCustomer, productId]);

    useEffect(() => {
        loadReviews().catch(() => {
            setReviews([]);
            setSummary({ averageRating: 0, totalReviews: 0, breakdown: DEFAULT_BREAKDOWN });
            setLoading(false);
        });
    }, [loadReviews]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (rating < 1) {
            setNotice({ type: "error", text: "Please select a rating before submitting." });
            return;
        }

        setSubmitting(true);
        setNotice(null);

        try {
            const response = await reviewApi.create(productId, {
                rating,
                comment: comment.trim(),
            });

            const submittedReview = normalizeReviews([unwrapResponse(response)])[0] ?? null;
            if (submittedReview) {
                submittedReview.ownedByCurrentCustomer = true;
                applyVisibleState(reviews, submittedReview, summary);
            }

            setNotice({ type: "success", text: myReviewId ? "Your review has been updated." : "Your review has been posted." });
            await loadReviews();
        } catch (error: any) {
            const message = error?.response?.data?.message ?? error?.message ?? "Unable to submit review right now.";
            setNotice({ type: "error", text: message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <MessageSquareText size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Reviews & Ratings</h2>
                    <p className="text-sm text-gray-500">See what customers think about {productName} and share your own experience.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-8 bg-gray-100 rounded w-1/2" />
                            <div className="h-24 bg-gray-100 rounded-2xl" />
                            <div className="space-y-3">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="h-20 bg-gray-100 rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-5 pb-5 border-b border-gray-100">
                                <div>
                                    <div className="text-4xl font-bold text-gray-800 leading-none">{summary.averageRating ? summary.averageRating.toFixed(1) : "--"}</div>
                                    <div className="mt-2">
                                        <StarDisplay value={Math.round(summary.averageRating)} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Based on {summary.totalReviews} review{summary.totalReviews === 1 ? "" : "s"}</p>
                                </div>

                                <div className="flex-1 min-w-[240px] space-y-2">
                                    {summary.breakdown.map((row) => {
                                        const percent = summary.totalReviews > 0 ? (row.count / summary.totalReviews) * 100 : 0;
                                        return (
                                            <div key={row.star} className="flex items-center gap-3 text-sm">
                                                <span className="w-10 text-gray-500">{row.star} star</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percent}%` }} />
                                                </div>
                                                <span className="w-8 text-right text-gray-500">{row.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                {reviews.length === 0 ? (
                                    <div className="py-10 text-center text-gray-500">
                                        <MessageSquareText size={32} className="mx-auto mb-3 text-gray-300" />
                                        <p className="font-medium text-gray-700">No reviews yet</p>
                                        <p className="text-sm mt-1">Be the first customer to leave feedback for this product.</p>
                                    </div>
                                ) : (
                                    reviews.map((review) => (
                                        <article key={review.reviewId} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                                                        <UserCircle2 size={22} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{review.customerName}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                                                    </div>
                                                </div>

                                                <StarDisplay value={review.rating} />
                                            </div>

                                            {review.comment && (
                                                <p className="text-sm text-gray-600 leading-relaxed mt-3">{review.comment}</p>
                                            )}

                                            {review.ownedByCurrentCustomer && isCustomer && (
                                                <div className="mt-4 flex items-center justify-between gap-3">
                                                    <p className="text-xs text-primary font-medium">Your review</p>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            setDeletingReviewId(review.reviewId);
                                                            setNotice(null);
                                                            try {
                                                                await reviewApi.deleteMyReview(Number(review.reviewId));
                                                                setNotice({ type: "success", text: "Your review has been deleted." });
                                                                applyVisibleState(reviews.filter((item) => String(item.reviewId) !== String(review.reviewId)), null, summary);
                                                                await loadReviews();
                                                            } catch (error: any) {
                                                                const message = error?.response?.data?.message ?? error?.message ?? "Unable to delete review right now.";
                                                                setNotice({ type: "error", text: message });
                                                            } finally {
                                                                setDeletingReviewId(null);
                                                            }
                                                        }}
                                                        disabled={deletingReviewId === review.reviewId}
                                                        className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
                                                    >
                                                        {deletingReviewId === review.reviewId ? "Deleting..." : "Delete"}
                                                    </button>
                                                </div>
                                            )}
                                        </article>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit">
                    <h3 className="font-semibold text-gray-800 mb-2">Write a review</h3>
                    <p className="text-sm text-gray-500 mb-5">Rate the product and share details that help other customers decide.</p>

                    {isCustomer ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your rating</label>
                                <StarDisplay value={rating} interactive onSelect={setRating} />
                            </div>

                            <div>
                                <label htmlFor={`review-comment-${productId}`} className="block text-sm font-medium text-gray-700 mb-2">
                                    Your review
                                </label>
                                <textarea
                                    id={`review-comment-${productId}`}
                                    rows={6}
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    placeholder="Tell others what you liked, what could be better, and how the product worked for you."
                                    className="input-field resize-none"
                                />
                            </div>

                            {notice && (
                                <div className={`rounded-xl px-4 py-3 text-sm ${notice.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                                    {notice.text}
                                </div>
                            )}

                            <button type="submit" disabled={submitting} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                                <Send size={16} />
                                {submitting ? "Submitting..." : myReviewId ? "Update Review" : "Submit Review"}
                            </button>
                        </form>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
                            <LogIn size={22} className="mx-auto text-gray-400" />
                            <p className="mt-3 text-sm font-medium text-gray-700">Sign in as a customer to leave a review</p>
                            <p className="mt-1 text-xs text-gray-500">Only logged-in customers can post ratings and feedback.</p>
                            <Link href="/auth/signin" className="inline-flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all">
                                <LogIn size={14} />
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}