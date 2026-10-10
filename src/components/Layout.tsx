import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Search, Bell, Menu, X, LogOut, LayoutDashboard, Settings, Shield, User as UserIcon,
  BookOpen, Square, Swords, FolderKanban, MessagesSquare, FileText, Sparkles,
  CheckCheck, Flame, Trophy, MessageSquare, Info, ChevronRight, ArrowUpRight,
} from "lucide-react";
import { useDB, timeAgo, levelFromXp } from "../lib/db";
import { currentUser, logout, searchAll, markAllRead } from "../lib/services";
import { Avatar, Badge, Kbd, Logo } from "./ui";
import { ScrollProgress } from "./PageTransition";

const NAV = [
  { to: "/languages", label: "Learn", icon: <BookOpen size={15} /> },
  { to: "/playground", label: "Playground", icon: <Square size={15} /> },
  { to: "/practice", label: "Practice", icon: <Swords size={15} /> },
  { to: "/projects", label: "Projects", icon: <FolderKanban size={15} /> },
  { to: "/community", label: "Community", icon: <MessagesSquare size={15} /> },
  { to: "/docs", label: "Docs", icon: <FileText size={15} /> },
  { to: "/ai-tutor", label: "AI Tutor", icon: <Sparkles size={15} /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const db = useDB();
  const user = currentUser(db);
  const nav = useNavigate();
  const loc = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileOpen(false); setBellOpen(false); setMenuOpen(false); }, [loc.pathname]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen((s) => !s); }
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, []);

  const myNotifs = user ? db.notifs.filter((n) => n.userId === user.id).slice(0, 12) : [];
  const unread = myNotifs.filter((n) => !n.read).length;
  const profile = user ? db.profiles.find((p) => p.userId === user.id) : null;

  const notifIcon = (kind: string) =>
    kind === "achievement" ? <Trophy size={15} className="text-ember" /> :
    kind === "challenge" ? <Flame size={15} className="text-jade" /> :
    kind === "community" ? <MessageSquare size={15} className="text-sky" /> :
    kind === "milestone" ? <Flame size={15} className="text-ember" /> :
    <Info size={15} className="text-mist" />;

  return (
    <div className="min-h-screen">
      <ScrollProgress />
      {/* ============ TOP NAV ============ */}
      <header className="sticky top-0 z-50 border-b border-line/80 bg-void/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="focusable flex items-center gap-2">
            <Logo size={27} />
          </Link>

          <nav className="ml-4 hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to}
                className={({ isActive }) =>
                  `focusable rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                    isActive ? "bg-jade/10 text-jade" : "text-mist hover:bg-white/5 hover:text-fog"}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)}
              className="focusable hidden h-9 items-center gap-2 rounded-lg border border-line bg-ink2/70 px-3 text-[13px] text-dim transition-colors hover:border-line2 hover:text-mist sm:flex">
              <Search size={14} /> Search… <Kbd>⌘K</Kbd>
            </button>
            <button onClick={() => setSearchOpen(true)} className="focusable grid h-9 w-9 place-items-center rounded-lg border border-line bg-ink2/70 text-mist hover:text-fog sm:hidden">
              <Search size={15} />
            </button>

            {user && (
              <div ref={bellRef} className="relative">
                <button onClick={() => setBellOpen((v) => !v)} aria-label="Notifications"
                  className="focusable relative grid h-9 w-9 place-items-center rounded-lg border border-line bg-ink2/70 text-mist transition-colors hover:text-fog">
                  <Bell size={15} />
                  {unread > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-jade px-1 text-[9px] font-bold text-[#04170e]">{unread}</span>
                  )}
                </button>
                {bellOpen && (
                  <div className="pop-in absolute right-0 top-11 w-[min(92vw,380px)] overflow-hidden rounded-xl border border-line2 bg-ink shadow-2xl">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                      <span className="font-display text-sm font-bold">Notifications</span>
                      <button onClick={() => markAllRead(user.id)} className="focusable flex items-center gap-1 text-[11px] font-semibold text-jade hover:underline"><CheckCheck size={12} /> Mark all read</button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {myNotifs.length === 0 && <div className="px-4 py-10 text-center text-sm text-dim">Nothing yet — go earn some XP.</div>}
                      {myNotifs.map((n) => (
                        <div key={n.id} className={`flex gap-3 border-b border-line/60 px-4 py-3 transition-colors hover:bg-white/2 ${n.read ? "opacity-60" : ""}`}>
                          <span className="mt-0.5 shrink-0">{notifIcon(n.kind)}</span>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold leading-snug text-fog">{n.title}</div>
                            <div className="mt-0.5 text-xs leading-relaxed text-mist">{n.body}</div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-dim">{timeAgo(n.at)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user && profile ? (
              <div ref={menuRef} className="relative">
                <button onClick={() => setMenuOpen((v) => !v)} className="focusable flex items-center gap-2 rounded-lg border border-line bg-ink2/70 py-1 pl-1 pr-2.5 transition-colors hover:border-line2">
                  <Avatar name={profile.displayName} hue={profile.hue} size={26} />
                  <span className="hidden text-[13px] font-semibold text-fog md:block">{user.username}</span>
                  <span className="hidden font-mono text-[10px] font-bold text-ember md:block">Lv{levelFromXp(db.xp[user.id] ?? 0).level}</span>
                </button>
                {menuOpen && (
                  <div className="pop-in absolute right-0 top-11 w-52 overflow-hidden rounded-xl border border-line2 bg-ink py-1 shadow-2xl">
                    {[
                      { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
                      { to: `/profile/${user.username}`, label: "Public profile", icon: <UserIcon size={14} /> },
                      { to: "/settings", label: "Settings", icon: <Settings size={14} /> },
                      ...(user.role === "admin" ? [{ to: "/admin", label: "Admin", icon: <Shield size={14} /> }] : []),
                    ].map((it) => (
                      <button key={it.to} onClick={() => nav(it.to)} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-medium text-mist transition-colors hover:bg-white/4 hover:text-fog">
                        {it.icon}{it.label}
                      </button>
                    ))}
                    <div className="my-1 border-t border-line" />
                    <button onClick={async () => { await logout(); nav("/"); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-medium text-rose/90 transition-colors hover:bg-rose/10">
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="focusable flex h-9 items-center rounded-lg bg-jade px-4 text-[13px] font-bold text-[#04170e] shadow-[0_4px_20px_-6px_rgba(52,211,153,0.5)] transition-all hover:bg-[#4ade9f] active:scale-95">
                Sign in
              </Link>
            )}

            <button onClick={() => setMobileOpen((v) => !v)} className="focusable grid h-9 w-9 place-items-center rounded-lg border border-line bg-ink2/70 text-mist lg:hidden" aria-label="Menu">
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="rise-in border-t border-line bg-ink/95 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="grid grid-cols-2 gap-1.5">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] font-semibold ${isActive ? "border-jade/40 bg-jade/10 text-jade" : "border-line bg-ink2 text-mist"}`}>
                  {n.icon}{n.label}
                </NavLink>
              ))}
              <NavLink to="/dashboard" className="flex items-center gap-2.5 rounded-lg border border-line bg-ink2 px-3 py-2.5 text-[13px] font-semibold text-mist">
                <LayoutDashboard size={15} />Dashboard
              </NavLink>
            </div>
          </div>
        )}
      </header>

      <main key={loc.pathname} className="page-enter">{children}</main>

      {/* ============ FOOTER ============ */}
      <footer className="mt-24 border-t border-line bg-ink/40">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-mist">Learn every language. Build anything. Lessons, a real playground, challenges, projects and a tutor — in one verse.</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="pulse-dot h-2 w-2 rounded-full bg-jade" />
              <span className="font-mono text-[11px] text-dim">all 13 languages run in Docker-isolated sandboxes · JS/TS also in-browser · labeled mock fallback when offline</span>
            </div>
          </div>
          {[
            { h: "Learn", items: [["Languages", "/languages"], ["Practice", "/practice"], ["Projects", "/projects"], ["Docs", "/docs"]] },
            { h: "Build", items: [["Playground", "/playground"], ["AI Tutor", "/ai-tutor"], ["Community", "/community"], ["Dashboard", "/dashboard"]] },
          ].map((col) => (
            <div key={col.h}>
              <div className="font-display text-sm font-bold text-fog">{col.h}</div>
              <ul className="mt-3 space-y-2">
                {col.items.map(([label, to]) => (
                  <li key={to}><Link to={to} className="group flex items-center gap-1 text-sm text-mist transition-colors hover:text-jade">{label}<ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" /></Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <div className="font-display text-sm font-bold text-fog">Architecture</div>
            <p className="mt-3 text-[13px] leading-relaxed text-dim">
              This build runs the <span className="text-mist">local adapter stack</span>: auth, database and execution persist in your browser.
              Production slots — Supabase Auth, PostgreSQL/Prisma, Judge0 sandboxes, LLM providers — are isolated behind the same service contracts.
            </p>
          </div>
        </div>
        <div className="border-t border-line/60 py-5 text-center font-mono text-[11px] text-dim">
          CodeVerse — Learn. Code. Run. Build. Master.
        </div>
      </footer>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

/* ============ GLOBAL SEARCH ============ */

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const db = useDB();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(q), 180);
    return () => window.clearTimeout(t);
  }, [q]);

  const hits = useMemo(() => searchAll(db, debounced), [db, debounced]);
  const grouped = useMemo(() => {
    const g: Record<string, typeof hits> = {};
    hits.forEach((h) => { (g[h.type] ||= []).push(h); });
    return g;
  }, [hits]);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="pop-in relative w-full max-w-xl overflow-hidden rounded-2xl border border-line2 bg-ink shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search size={17} className="text-jade" />
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && hits.length) { nav(hits[0].to); onClose(); }
            }}
            placeholder="Search languages, lessons, challenges, projects, posts…"
            className="w-full bg-transparent text-sm text-fog placeholder:text-dim outline-none"
          />
          <Kbd>esc</Kbd>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {debounced.length < 2 && (
            <div className="px-3 py-8 text-center text-sm text-dim">
              Type at least 2 characters — try <span className="text-mist">"python"</span>, <span className="text-mist">"join"</span>, <span className="text-mist">"recursion"</span>
            </div>
          )}
          {debounced.length >= 2 && hits.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-dim">No matches for "{debounced}".</div>
          )}
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type} className="mb-1.5">
              <div className="px-3 pb-1 pt-2 font-mono text-[10px] font-bold uppercase tracking-wider text-dim">{type}s</div>
              {items.map((h) => (
                <button key={h.to + h.title} onClick={() => { nav(h.to); onClose(); }}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-jade/8">
                  <ChevronRight size={13} className="text-dim group-hover:text-jade" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-fog group-hover:text-jade">{h.title}</span>
                    <span className="block truncate text-xs text-dim">{h.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
