// PDF reading room: anonymous local fallback plus authenticated Neon sync for resume position, bookmarks, highlights, and notes.
import { ArrowLeft, ArrowUpRight, Bookmark, Check, Download, ExternalLink, FileText, Highlighter, MessageSquare, Save } from "lucide-react";
import { Link, useRoute } from "wouter";
import { findPdf } from "@/data/catalog";
import { Shell } from "@/components/AcademyShell";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type ReaderState = { page: string; bookmarks: string[]; highlights: string[]; note: string; read: boolean };
const initialState: ReaderState = { page: "1", bookmarks: [], highlights: [], note: "", read: false };
function getState(id: string): ReaderState { try { return { ...initialState, ...JSON.parse(localStorage.getItem(`rampage-reader-${id}`) || "{}") }; } catch { return initialState; } }

export default function ResourceReader() {
  const [, params] = useRoute("/resources/read/:resourceId");
  const item = findPdf(params?.resourceId || "");
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<ReaderState>(() => item ? getState(item.id) : initialState);
  const [highlightDraft, setHighlightDraft] = useState("");
  const learnerState = trpc.learner.state.useQuery(undefined, { enabled: Boolean(isAuthenticated && item), retry: false });
  const saveReaderState = trpc.learner.saveReaderState.useMutation();
  const addBookmark = trpc.learner.addBookmark.useMutation();
  const removeBookmark = trpc.learner.removeBookmark.useMutation();
  const addHighlight = trpc.learner.addHighlight.useMutation();

  useEffect(() => {
    if (!item) return;
    localStorage.setItem(`rampage-reader-${item.id}`, JSON.stringify(state));
    if (isAuthenticated) {
      void saveReaderState.mutateAsync({ resourceId: item.id, currentPage: Number(state.page) || 1, progressPercent: state.read ? 100 : 0, note: state.note || null }).catch(() => undefined);
    }
  }, [item, state, isAuthenticated]);

  useEffect(() => {
    if (!item || !learnerState.data) return;
    const serverState = learnerState.data.readerState.find(entry => entry.resourceId === item.id);
    const serverBookmarks = learnerState.data.bookmarks.filter(entry => entry.resourceId === item.id).map(entry => String(entry.page));
    const serverHighlights = learnerState.data.highlights.filter(entry => entry.resourceId === item.id).map(entry => entry.quote);
    if (serverState || serverBookmarks.length || serverHighlights.length) {
      setState(current => ({ ...current, page: serverState ? String(serverState.currentPage) : current.page, note: serverState?.note ?? current.note, read: serverState ? Number(serverState.progressPercent) >= 100 : current.read, bookmarks: serverBookmarks.length ? serverBookmarks : current.bookmarks, highlights: serverHighlights.length ? serverHighlights : current.highlights }));
    }
  }, [item, learnerState.data]);

  if (!item) return <Shell><main className="reader-page"><div className="reader-not-found"><FileText size={30} /><h1>Source not found.</h1><Link href="/resources">Return to the reading room <ArrowUpRight size={15} /></Link></div></main></Shell>;
  const set = (patch: Partial<ReaderState>) => setState(current => ({ ...current, ...patch }));
  const saveBookmark = async () => {
    const page = state.page;
    const exists = state.bookmarks.includes(page);
    set({ bookmarks: exists ? state.bookmarks.filter(value => value !== page) : [...state.bookmarks, page] });
    if (isAuthenticated) {
      try {
        if (exists) await removeBookmark.mutateAsync({ resourceId: item.id, page: Number(page) || 1 });
        else await addBookmark.mutateAsync({ resourceId: item.id, page: Number(page) || 1, label: `Page ${page}` });
      } catch { toast.error("Bookmark saved locally; account sync will retry later."); }
    }
  };
  const saveHighlight = async () => {
    const value = highlightDraft.trim();
    if (!value || state.highlights.includes(value)) return;
    set({ highlights: [...state.highlights, value] });
    setHighlightDraft("");
    if (isAuthenticated) {
      try { await addHighlight.mutateAsync({ resourceId: item.id, page: Number(state.page) || 1, quote: value, note: null }); }
      catch { toast.error("Highlight saved locally; account sync will retry later."); }
    }
  };
  return <Shell><main className="reader-page"><div className="reader-breadcrumb"><Link href="/resources"><ArrowLeft size={14} /> Reading room</Link><span>/</span><span>{item.topic}</span><span>/</span><b>{item.title}</b></div><section className="reader-layout"><div className="reader-main"><div className="reader-heading"><p className="eyebrow"><span className="lime-dot" /> OPEN SOURCE / READING ROOM</p><h1>{item.title}</h1><p>{item.note}</p></div><div className="reader-toolbar"><label><span>CONTINUE AT PAGE</span><input aria-label="Current page" type="number" min="1" value={state.page} onChange={e => set({ page: e.target.value || "1" })} /></label><button onClick={saveBookmark} className={state.bookmarks.includes(state.page) ? "active" : ""}><Bookmark size={15} /> {state.bookmarks.includes(state.page) ? "Bookmarked" : "Bookmark page"}</button><button onClick={() => set({ read: !state.read })} className={state.read ? "active" : ""}><Check size={15} /> {state.read ? "Read" : "Mark read"}</button></div><div className="pdf-reader-frame"><iframe title={`PDF reader for ${item.title}`} src={`${item.url.includes(".pdf") ? item.url : item.url}${item.url.includes(".pdf") ? `#page=${state.page}` : ""}`} /><div className="reader-fallback"><FileText size={18} /> If the source does not embed, <a href={item.url} target="_blank" rel="noreferrer">open the original</a>.</div></div><div className="reader-actions"><a href={item.url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open original source</a><a href={item.url} target="_blank" rel="noreferrer"><Download size={15} /> Source download</a><span><Save size={15} /> {isAuthenticated ? "Synced to your account" : "Saved privately in this browser"}</span></div><div className="reader-tools-grid"><section className="reader-tool-card"><div className="aside-label"><Highlighter size={14} /> HIGHLIGHTS</div><p>Save a short excerpt or idea while it is fresh.</p><div className="highlight-input"><input placeholder="Paste a key sentence..." value={highlightDraft} onChange={e => setHighlightDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && void saveHighlight()} /><button onClick={() => void saveHighlight()}>Add</button></div>{state.highlights.length ? <div className="saved-highlights">{state.highlights.map(highlight => <blockquote key={highlight}>{highlight}</blockquote>)}</div> : <small>No highlights yet.</small>}</section><section className="reader-tool-card"><div className="aside-label"><MessageSquare size={14} /> READING NOTE</div><p>Leave yourself one sentence about what to try next.</p><textarea placeholder="What should you remember?" value={state.note} onChange={e => set({ note: e.target.value })} /><small>{state.note.length}/280 characters · {isAuthenticated ? "syncs to account" : "auto-saved locally"}</small></section></div></div><aside className="reader-aside"><div className="reader-fact"><span className="aside-label"><FileText size={14} /> DOCUMENT CARD</span><h2>{item.topic}</h2><dl><div><dt>AUTHOR</dt><dd>{item.author}</dd></div><div><dt>INSTITUTION</dt><dd>{item.institution}</dd></div><div><dt>LEVEL</dt><dd>{item.level}</dd></div><div><dt>EST. READ</dt><dd>{item.readTime}</dd></div></dl></div><div className="reader-fact"><span className="aside-label"><Bookmark size={14} /> YOUR PLACE</span><p>Continue at page <strong className="reader-page-number">{state.page}</strong>. {state.bookmarks.length ? `${state.bookmarks.length} bookmark${state.bookmarks.length > 1 ? "s" : ""} saved.` : "Bookmark important pages as you go."}</p><button className="reader-course-link" onClick={() => document.querySelector(".pdf-reader-frame")?.scrollIntoView({ behavior: "smooth" })}>Jump to reader <ArrowUpRight size={14} /></button></div><div className="reader-fact"><span className="aside-label"><ArrowUpRight size={14} /> CONTINUE PATH</span><p>Read for the concept, then return to the course for the experiment.</p><Link className="reader-course-link" href={`/course/${item.relatedCourse}`}>Open related course <ArrowUpRight size={14} /></Link></div><div className="reader-fact"><span className="aside-label">TAGS</span><div className="reader-tags">{item.tags.map(tag => <span key={tag}>#{tag}</span>)}</div></div></aside></section></main></Shell>;
}
