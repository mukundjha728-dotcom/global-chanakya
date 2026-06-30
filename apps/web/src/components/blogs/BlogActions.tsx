"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Bookmark, MessageCircle, Share2, Send, X, Loader2, LogIn } from "lucide-react";
import Link from "next/link";

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

interface BlogActionsProps {
  slug: string;
  initialLikes: number;
  initialBookmarks: number;
  isLoggedIn: boolean;
  commentsEnabled: boolean;
}

export default function BlogActions({
  slug,
  initialLikes,
  initialBookmarks,
  isLoggedIn,
  commentsEnabled,
}: BlogActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [animateLike, setAnimateLike] = useState(false);
  const [animateBookmark, setAnimateBookmark] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch initial like/bookmark state
  useEffect(() => {
    if (!isLoggedIn) return;

    fetch(`/api/blogs/${slug}/like`)
      .then((r) => r.json())
      .then((data) => {
        setLiked(data.liked);
        setLikes(data.likes);
      })
      .catch(() => {});

    fetch(`/api/blogs/${slug}/bookmark`)
      .then((r) => r.json())
      .then((data) => {
        setBookmarked(data.bookmarked);
        setBookmarks(data.bookmarks);
      })
      .catch(() => {});
  }, [slug, isLoggedIn]);

  // View tracking moved to BlogClientTracker to handle advanced analytics and pings

  const handleLike = useCallback(async () => {
    if (!isLoggedIn) {
      showToast("Sign in to like articles", "error");
      return;
    }
    if (loadingLike) return;
    
    // Optimistic UI update
    setLoadingLike(true);
    setAnimateLike(true);
    const prevLiked = liked;
    const prevLikes = likes;
    
    setLiked(!prevLiked);
    setLikes(prevLikes + (!prevLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/blogs/${slug}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Update with server truth
      setLiked(data.liked);
      setLikes(data.likes);
      showToast(data.liked ? "Article liked!" : "Like removed");
    } catch (err: any) {
      // Rollback
      setLiked(prevLiked);
      setLikes(prevLikes);
      showToast(err.message || "Failed to like article", "error");
    } finally {
      setLoadingLike(false);
      setTimeout(() => setAnimateLike(false), 400);
    }
  }, [slug, isLoggedIn, loadingLike, liked, likes]);

  const handleBookmark = useCallback(async () => {
    if (!isLoggedIn) {
      showToast("Sign in to save articles", "error");
      return;
    }
    if (loadingBookmark) return;
    
    // Optimistic UI update
    setLoadingBookmark(true);
    setAnimateBookmark(true);
    const prevBookmarked = bookmarked;
    const prevBookmarks = bookmarks;
    
    setBookmarked(!prevBookmarked);
    setBookmarks(prevBookmarks + (!prevBookmarked ? 1 : -1));

    try {
      const res = await fetch(`/api/blogs/${slug}/bookmark`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Update with server truth
      setBookmarked(data.bookmarked);
      setBookmarks(data.bookmarks);
      showToast(data.bookmarked ? "Article saved!" : "Article removed from saved");
    } catch (err: any) {
      // Rollback
      setBookmarked(prevBookmarked);
      setBookmarks(prevBookmarks);
      showToast(err.message || "Failed to save article", "error");
    } finally {
      setLoadingBookmark(false);
      setTimeout(() => setAnimateBookmark(false), 400);
    }
  }, [slug, isLoggedIn, loadingBookmark, bookmarked, bookmarks]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!");
    }
  }, []);

  const toggleComments = useCallback(async () => {
    const willOpen = !showComments;
    setShowComments(willOpen);

    if (willOpen && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await fetch(`/api/blogs/${slug}/comments`);
        const data = await res.json();
        if (res.ok) {
          setComments(data.comments || []);
        }
      } catch {
        showToast("Failed to load comments", "error");
      } finally {
        setLoadingComments(false);
      }
    }

    if (willOpen) {
      setTimeout(() => commentInputRef.current?.focus(), 200);
    }
  }, [showComments, comments.length, slug]);

  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim() || !isLoggedIn || loadingComment) return;
    setLoadingComment(true);

    try {
      const res = await fetch(`/api/blogs/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentText("");
        showToast("Comment added!");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to post comment", "error");
    } finally {
      setLoadingComment(false);
    }
  }, [commentText, isLoggedIn, loadingComment, slug]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <>
      {/* ── Floating Action Bar ── */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "6px 8px",
          borderRadius: "999px",
          background: "rgba(15,15,15,0.92)",
          backdropFilter: "blur(20px) saturate(1.8)",
          WebkitBackdropFilter: "blur(20px) saturate(1.8)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={loadingLike}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            borderRadius: "999px",
            border: "none",
            background: liked ? "rgba(239,68,68,0.15)" : "transparent",
            color: liked ? "#f87171" : "#9ca3af",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            transform: animateLike ? "scale(1.15)" : "scale(1)",
          }}
          title={liked ? "Unlike" : "Like"}
        >
          <Heart
            style={{
              width: "18px",
              height: "18px",
              fill: liked ? "#f87171" : "none",
              transition: "all 0.2s ease",
            }}
          />
          <span>{likes}</span>
        </button>

        {/* Comment */}
        {commentsEnabled && (
          <button
            onClick={toggleComments}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "999px",
              border: "none",
              background: showComments ? "rgba(59,130,246,0.15)" : "transparent",
              color: showComments ? "#60a5fa" : "#9ca3af",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            title="Comments"
          >
            <MessageCircle style={{ width: "18px", height: "18px" }} />
            <span>{comments.length > 0 ? comments.length : ""}</span>
          </button>
        )}

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          disabled={loadingBookmark}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            borderRadius: "999px",
            border: "none",
            background: bookmarked ? "rgba(245,158,11,0.15)" : "transparent",
            color: bookmarked ? "#fbbf24" : "#9ca3af",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            transform: animateBookmark ? "scale(1.15)" : "scale(1)",
          }}
          title={bookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <Bookmark
            style={{
              width: "18px",
              height: "18px",
              fill: bookmarked ? "#fbbf24" : "none",
              transition: "all 0.2s ease",
            }}
          />
          <span>{bookmarks > 0 ? bookmarks : ""}</span>
        </button>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "24px",
            background: "rgba(255,255,255,0.1)",
            margin: "0 4px",
          }}
        />

        {/* Share */}
        <button
          onClick={handleShare}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 14px",
            borderRadius: "999px",
            border: "none",
            background: "transparent",
            color: "#9ca3af",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          title="Share"
        >
          <Share2 style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Sign-in nudge for unauthenticated users */}
        {!isLoggedIn && (
          <>
            <div
              style={{
                width: "1px",
                height: "24px",
                background: "rgba(255,255,255,0.1)",
                margin: "0 4px",
              }}
            />
            <Link
              href="/auth/signin"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(239,68,68,0.15)",
                color: "#f87171",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              <LogIn style={{ width: "14px", height: "14px" }} />
              Sign In
            </Link>
          </>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            padding: "10px 20px",
            borderRadius: "12px",
            background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "#34d399" : "#f87171",
            fontSize: "13px",
            fontWeight: 600,
            backdropFilter: "blur(12px)",
            animation: "fadeInUp 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      {/* ── Comments Panel ── */}
      {showComments && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 39,
            width: "min(460px, calc(100vw - 32px))",
            maxHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: "20px",
            background: "rgba(12,12,14,0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3
              style={{
                color: "#e5e7eb",
                fontSize: "15px",
                fontWeight: 700,
                margin: 0,
              }}
            >
              Comments {comments.length > 0 && `(${comments.length})`}
            </h3>
            <button
              onClick={() => setShowComments(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.06)",
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              <X style={{ width: "14px", height: "14px" }} />
            </button>
          </div>

          {/* Comment Input */}
          {isLoggedIn ? (
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                  placeholder="Share your thoughts..."
                  rows={2}
                  style={{
                    flex: 1,
                    resize: "none",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#e5e7eb",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || loadingComment}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      commentText.trim()
                        ? "linear-gradient(135deg, #ef4444, #f59e0b)"
                        : "rgba(255,255,255,0.06)",
                    color: commentText.trim() ? "#fff" : "#4b5563",
                    cursor: commentText.trim() ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}
                >
                  {loadingComment ? (
                    <Loader2
                      style={{
                        width: "16px",
                        height: "16px",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  ) : (
                    <Send style={{ width: "16px", height: "16px" }} />
                  )}
                </button>
              </div>
              <p
                style={{
                  color: "#4b5563",
                  fontSize: "11px",
                  marginTop: "6px",
                }}
              >
                Press Enter to submit · Shift+Enter for new line
              </p>
            </div>
          ) : (
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
              }}
            >
              <Link
                href="/auth/signin"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 20px",
                  borderRadius: "999px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#f87171",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <LogIn style={{ width: "14px", height: "14px" }} />
                Sign in to comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 20px 16px",
            }}
          >
            {loadingComments ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "32px",
                  color: "#6b7280",
                }}
              >
                <Loader2
                  style={{
                    width: "20px",
                    height: "20px",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            ) : comments.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: "#4b5563",
                  fontSize: "13px",
                }}
              >
                <MessageCircle
                  style={{
                    width: "28px",
                    height: "28px",
                    margin: "0 auto 8px",
                    opacity: 0.4,
                  }}
                />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  style={{
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #ef4444, #f59e0b)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {comment.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          color: "#e5e7eb",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {comment.user?.name || "Anonymous"}
                      </span>
                      <span
                        style={{
                          color: "#4b5563",
                          fontSize: "11px",
                          marginLeft: "8px",
                        }}
                      >
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p
                    style={{
                      color: "#d1d5db",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      margin: 0,
                      paddingLeft: "38px",
                      wordBreak: "break-word",
                    }}
                  >
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
