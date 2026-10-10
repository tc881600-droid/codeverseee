import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Heart, MessageSquare, Bookmark, Flag, ChevronLeft, Send, MessagesSquare,
  HelpCircle, Share2, CircleDashed, ArrowBigUp, PenLine,
} from "lucide-react";
import { useDB, timeAgo } from "../lib/db";
import { currentUser, createPost, addComment, toggleLike, toggleBookmark, reportPost } from "../lib/services";
import type { Post } from "../lib/types";
import { Avatar, Badge, Button, EmptyState, Field, Input, Markdown, Modal, Panel, Reveal, Select, Tabs, Textarea, useToast } from "../components/ui";

const KIND_META: Record<Post["kind"], { label: string; tone: "sky" | "jade" | "viol"; icon: React.ReactNode }> = {
  question: { label: "question", tone: "sky", icon: <HelpCircle size={12} /> },
  share: { label: "project share", tone: "jade", icon: <Share2 size={12} /> },
  discussion: { label: "discussion", tone: "viol", icon: <CircleDashed size={12} /> },
};

export function CommunityPage() {
  const db = useDB();
  const user = currentUser(db);
  const nav = useNavigate();
  const toast = useToast();
  const [kind, setKind] = useState<Post["kind"]>("all" as Post["kind"]);
  const [sort, setSort] = useState<"new" | "top">("new");
  const [composerOpen, setComposerOpen] = useState(false);

  // composer state
  const [cKind, setCKind] = useState<Post["kind"]>("question");
  const [cTitle, setCTitle] = useState("");
  const [cBody, setCBody] = useState("");
  const [cTags, setCTags] = useState("");
  const [cErr, setCErr] = useState("");

  const posts = useMemo(() => {
    let list = [...db.posts];
    if (kind !== ("all" as Post["kind"])) list = list.filter((p) => p.kind === kind);
    list.sort((a, b) => sort === "new" ? b.at - a.at :
      db.likes.filter((l) => l.endsWith(":" + b.id)).length - db.likes.filter((l) => l.endsWith(":" + a.id)).length);
    return list;
  }, [db.posts, db.likes, kind, sort]);

  const tags = useMemo(() => [...new Set(db.posts.flatMap((p) => p.tags))].slice(0, 12), [db.posts]);
  const [tagFilter, setTagFilter] = useState("");
  const visible = posts.filter((p) => !tagFilter || p.tags.includes(tagFilter));

  const publish = () => {
    if (!user) { toast.push({ tone: "error", title: "Sign in to post" }); return; }
    const res = createPost(user.id, { kind: cKind, title: cTitle, body: cBody, tags: cTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) });
    if (!res.ok) { setCErr(res.error || ""); return; }
    setComposerOpen(false); setCTitle(""); setCBody(""); setCTags(""); setCErr("");
    toast.push({ tone: "success", title: "Posted to the verse", desc: "Your post is live." });
    if (res.id) nav(`/community/${res.id}`);
  };

  return (
    <div className="mx-auto max-w-[980px] px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-jade">~/community</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">The commons</h1>
          <p className="mt-2 max-w-lg text-[15px] text-mist">Questions, project shares and mental models from developers across the verse.</p>
        </div>
        <Button onClick={() => setComposerOpen(true)} icon={<PenLine size={14} />}>New post</Button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Tabs size="sm" active={kind} onChange={(k) => setKind(k as Post["kind"])}
          tabs={[{ id: "all", label: "All" }, { id: "question", label: "Questions" }, { id: "share", label: "Shares" }, { id: "discussion", label: "Discussions" }]} />
        <Select value={sort} onChange={(e) => setSort(e.target.value as "new" | "top")} className="w-32 !py-1.5 !text-xs">
          <option value="new">Newest</option><option value="top">Top liked</option>
        </Select>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button onClick={() => setTagFilter("")} className={`rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${!tagFilter ? "border-jade/40 bg-jade/10 text-jade" : "border-line text-dim hover:text-mist"}`}>all tags</button>
        {tags.map((t) => (
          <button key={t} onClick={() => setTagFilter(tagFilter === t ? "" : t)}
            className={`rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${tagFilter === t ? "border-jade/40 bg-jade/10 text-jade" : "border-line text-dim hover:text-mist"}`}>
            #{t}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {visible.map((p, i) => <PostCard key={p.id} post={p} delay={Math.min(i, 6) * 50} />)}
        {visible.length === 0 && <EmptyState icon={<MessagesSquare size={28} />} title="Nothing here yet" desc="Be the first — the verse is listening." action={<Button onClick={() => setComposerOpen(true)}>Start a thread</Button>} />}
      </div>

      <Modal open={composerOpen} onClose={() => setComposerOpen(false)} title="New post" width="max-w-xl">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <Select value={cKind} onChange={(e) => setCKind(e.target.value as Post["kind"])}>
                <option value="question">Question — need help</option>
                <option value="share">Project share — show & tell</option>
                <option value="discussion">Discussion — open floor</option>
              </Select>
            </Field>
            <Field label="Tags" hint="comma separated, max 4">
              <Input value={cTags} onChange={(e) => setCTags(e.target.value)} placeholder="javascript, debugging" />
            </Field>
          </div>
          <Field label="Title"><Input value={cTitle} onChange={(e) => setCTitle(e.target.value)} placeholder="A specific, searchable title" /></Field>
          <Field label="Body" hint="Markdown-lite: **bold**, `code`, ``` fences, - lists">
            <Textarea rows={7} value={cBody} onChange={(e) => setCBody(e.target.value)} placeholder={"What did you try? What did you expect? What happened?\n\n```js\n// code speaks louder\n```"} />
          </Field>
          {cErr && <div className="rounded-lg border border-rose/30 bg-rose/10 px-3.5 py-2.5 text-[13px] font-medium text-rose">{cErr}</div>}
          <div className="flex justify-end gap-2.5">
            <Button variant="ghost" onClick={() => setComposerOpen(false)}>Cancel</Button>
            <Button onClick={publish} icon={<Send size={13} />}>Publish</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PostCard({ post, delay }: { post: Post; delay: number }) {
  const db = useDB();
  const user = currentUser(db);
  const toast = useToast();
  const author = db.profiles.find((p) => p.userId === post.authorId);
  const likes = db.likes.filter((l) => l.endsWith(":" + post.id)).length;
  const liked = user ? db.likes.includes(`${user.id}:${post.id}`) : false;
  const bookmarked = user ? db.bookmarks.includes(`${user.id}:${post.id}`) : false;
  const comments = db.comments.filter((c) => c.postId === post.id).length;
  const meta = KIND_META[post.kind];

  const act = (fn: () => void, msg?: string) => {
    if (!user) { toast.push({ tone: "error", title: "Sign in first", desc: "Community actions need an account." }); return; }
    fn();
    if (msg) toast.push({ tone: "success", title: msg });
  };

  return (
    <Reveal delay={delay}>
      <div className="group rounded-2xl border border-line bg-ink/70 p-5 transition-all hover:border-line2 hover:bg-ink2">
        <div className="flex items-center gap-2.5">
          <Link to={`/profile/${db.users.find((u) => u.id === post.authorId)?.username || ""}`}><Avatar name={author?.displayName || "?"} hue={author?.hue || 200} size={30} /></Link>
          <Link to={`/profile/${db.users.find((u) => u.id === post.authorId)?.username || ""}`} className="text-[13px] font-bold text-fog hover:text-jade">{author?.displayName}</Link>
          <Badge tone={meta.tone}>{meta.icon}{meta.label}</Badge>
          <span className="ml-auto font-mono text-[10px] text-dim">{timeAgo(post.at)}</span>
        </div>
        <Link to={`/community/${post.id}`}>
          <h3 className="mt-3 font-display text-lg font-bold leading-snug text-fog transition-colors group-hover:text-jade">{post.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-mist">{post.body.replace(/```[\s\S]*?```/g, " 〔code〕 ").slice(0, 220)}</p>
        </Link>
        <div className="mt-4 flex items-center gap-1.5">
          {post.tags.map((t) => <span key={t} className="rounded-md bg-white/4 px-2 py-0.5 font-mono text-[10.5px] text-dim">#{t}</span>)}
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => act(() => toggleLike(user!.id, post.id))}
              className={`focusable flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-bold transition-all active:scale-90 ${liked ? "bg-rose/12 text-rose" : "text-mist hover:bg-white/5 hover:text-rose"}`}>
              <Heart size={14} fill={liked ? "currentColor" : "none"} />{likes}
            </button>
            <Link to={`/community/${post.id}`} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-mist transition-colors hover:bg-white/5 hover:text-sky">
              <MessageSquare size={14} />{comments}
            </Link>
            <button onClick={() => act(() => toggleBookmark(user!.id, post.id), bookmarked ? undefined : "Bookmarked")}
              className={`focusable rounded-lg p-1.5 transition-colors ${bookmarked ? "text-ember" : "text-mist hover:bg-white/5 hover:text-ember"}`} aria-label="Bookmark">
              <Bookmark size={14} fill={bookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function CommunityPostPage() {
  const { postId } = useParams();
  const db = useDB();
  const user = currentUser(db);
  const toast = useToast();
  const post = db.posts.find((p) => p.id === postId);
  const [comment, setComment] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!post) {
    return <div className="mx-auto max-w-2xl px-4 py-24"><EmptyState icon={<MessagesSquare size={30} />} title="Post not found" desc="It may have been removed by moderation." action={<Link to="/community"><Button variant="outline">Back to community</Button></Link>} /></div>;
  }

  const author = db.profiles.find((p) => p.userId === post.authorId);
  const authorUser = db.users.find((u) => u.id === post.authorId);
  const comments = db.comments.filter((c) => c.postId === post.id).sort((a, b) => a.at - b.at);
  const likes = db.likes.filter((l) => l.endsWith(":" + post.id)).length;
  const liked = user ? db.likes.includes(`${user.id}:${post.id}`) : false;
  const bookmarked = user ? db.bookmarks.includes(`${user.id}:${post.id}`) : false;
  const meta = KIND_META[post.kind];

  const send = () => {
    if (!user) { toast.push({ tone: "error", title: "Sign in to reply" }); return; }
    const res = addComment(user.id, post.id, comment);
    if (!res.ok) { toast.push({ tone: "error", title: res.error || "Could not post" }); return; }
    setComment("");
    toast.push({ tone: "success", title: "Reply posted" });
  };

  const sendReport = () => {
    if (!user) { toast.push({ tone: "error", title: "Sign in to report" }); return; }
    const res = reportPost(user.id, post.id, reason);
    if (!res.ok) { toast.push({ tone: "error", title: res.error || "Could not report" }); return; }
    setReportOpen(false); setReason("");
    toast.push({ tone: "success", title: "Report filed", desc: "A moderator will review it. Thanks for keeping the verse clean." });
  };

  return (
    <div className="mx-auto max-w-[860px] px-4 py-10 sm:px-6">
      <Link to="/community" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-mist hover:text-jade"><ChevronLeft size={14} /> Community</Link>

      <Panel className="mt-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <Avatar name={author?.displayName || "?"} hue={author?.hue || 200} size={34} />
          <div>
            <Link to={`/profile/${authorUser?.username || ""}`} className="text-sm font-bold text-fog hover:text-jade">{author?.displayName}</Link>
            <div className="font-mono text-[10px] text-dim">@{authorUser?.username} · {timeAgo(post.at)}</div>
          </div>
          <Badge tone={meta.tone} className="ml-1">{meta.icon}{meta.label}</Badge>
        </div>

        <h1 className="mt-5 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{post.title}</h1>
        <div className="mt-4"><Markdown text={post.body} /></div>
        <div className="mt-4 flex flex-wrap gap-1.5">{post.tags.map((t) => <span key={t} className="rounded-md bg-white/4 px-2 py-0.5 font-mono text-[11px] text-dim">#{t}</span>)}</div>

        <div className="mt-6 flex items-center gap-2 border-t border-line pt-5">
          <button onClick={() => { if (!user) { toast.push({ tone: "error", title: "Sign in first" }); return; } toggleLike(user.id, post.id); }}
            className={`focusable flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-bold transition-all active:scale-95 ${liked ? "border-rose/35 bg-rose/10 text-rose" : "border-line text-mist hover:border-rose/35 hover:text-rose"}`}>
            <Heart size={15} fill={liked ? "currentColor" : "none"} />{likes} {likes === 1 ? "like" : "likes"}
          </button>
          <button onClick={() => { if (!user) { toast.push({ tone: "error", title: "Sign in first" }); return; } toggleBookmark(user.id, post.id); }}
            className={`focusable flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-bold transition-colors ${bookmarked ? "border-ember/35 bg-ember/10 text-ember" : "border-line text-mist hover:border-ember/35 hover:text-ember"}`}>
            <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />{bookmarked ? "Saved" : "Save"}
          </button>
          <button onClick={() => setReportOpen(true)} className="focusable ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-dim transition-colors hover:text-rose">
            <Flag size={13} />Report
          </button>
        </div>
      </Panel>

      <h2 className="mt-10 flex items-center gap-2 font-display text-lg font-bold"><ArrowBigUp size={18} className="text-jade" />{comments.length} {comments.length === 1 ? "reply" : "replies"}</h2>
      <div className="mt-4 space-y-3">
        {comments.map((c) => {
          const ca = db.profiles.find((p) => p.userId === c.authorId);
          const cu = db.users.find((u) => u.id === c.authorId);
          return (
            <div key={c.id} className="rise-in flex gap-3.5 rounded-xl border border-line bg-ink/60 p-4">
              <Link to={`/profile/${cu?.username || ""}`}><Avatar name={ca?.displayName || "?"} hue={ca?.hue || 200} size={32} /></Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${cu?.username || ""}`} className="text-[13px] font-bold text-fog hover:text-jade">{ca?.displayName}</Link>
                  <span className="font-mono text-[10px] text-dim">{timeAgo(c.at)}</span>
                </div>
                <p className="mt-1 text-[13.5px] leading-relaxed text-mist">{c.body}</p>
              </div>
            </div>
          );
        })}
        {comments.length === 0 && <p className="text-sm text-dim">No replies yet — share what you know.</p>}
      </div>

      <Panel className="mt-6 p-4">
        <div className="flex gap-3">
          <Avatar name={user ? (db.profiles.find((p) => p.userId === user.id)?.displayName || user.username) : "?"} hue={user ? (db.profiles.find((p) => p.userId === user.id)?.hue || 160) : 0} size={34} />
          <div className="flex-1">
            <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={user ? "Add to the discussion…" : "Sign in to join the discussion"} />
            <div className="mt-2 flex justify-end"><Button size="sm" onClick={send} icon={<Send size={12} />} disabled={!user}>Reply</Button></div>
          </div>
        </div>
      </Panel>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report this post">
        <Field label="Reason">
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Spam, abuse, misleading content…" />
        </Field>
        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={sendReport} icon={<Flag size={13} />}>Submit report</Button>
        </div>
      </Modal>
    </div>
  );
}
