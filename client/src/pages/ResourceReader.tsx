// Embedded source reading room: local-first resume, bookmarks, annotations, highlights, and Neon sync.
import { ArrowLeft, ArrowUpRight, Bookmark, Check, Download, ExternalLink, FileText, Focus, Highlighter, Maximize2, MessageSquare, Minus, Moon, Plus, Save, Sun, X } from "lucide-react";
import { Link, useRoute } from "wouter";
import { findPdf } from "@/data/catalog";
import { Shell } from "@/components/AcademyShell";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type HighlightEntry = { quote: string; page: string; note: string };
type ReaderState = { page: string; bookmarks: string[]; highlights: HighlightEntry[]; note: string; read: boolean; zoom: number; dark: boolean };
const initialState: ReaderState = { page: "1", bookmarks: [], highlights: [], note: "", read: false, zoom: 100, dark: false };
function getState(id: string): ReaderState {
  try {
    const parsed = JSON.parse(localStorage.getItem(`rampage-reader-${id}`) || "{}");
    const highlights = Array.isArray(parsed.highlights) ? parsed.highlights.map((entry: string | HighlightEntry) => typeof entry === "string" ? ({ quote: entry, page: parsed.page || "1", note: "" }) : entry) : [];
    return { ...initialState, ...parsed, highlights };
  } catch { return initialState; }
}

export default function ResourceReader() {
  const [, params] = useRoute("/resources/read/:resourceId");
  const item = findPdf(params?.resourceId || "");
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<ReaderState>(() => item ? getState(item.id) : initialState);
  const [highlightDraft, setHighlightDraft] = useState("");
  const [annotationDraft, setAnnotationDraft] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);
  const learnerState = trpc.learner.state.useQuery(undefined, { enabled: Boolean(isAuthenticated && item), retry: false });
  const saveReaderState = trpc.learner.saveReaderState.useMutation();
  const addBookmark = trpc.learner.addBookmark.useMutation();
  const removeBookmark = trpc.learner.removeBookmark.useMutation();
  const addHighlight = trpc.learner.addHighlight.useMutation();

  useEffect(() => {
    if (!item) return;
    localStorage.setItem(`rampage-reader-${item.id}`, JSON.stringify(state));
    if (isAuthenticated) void saveReaderState.mutateAsync({ resourceId: item.id, currentPage: Number(state.page) || 1, progressPercent: state.read ? 100 : Math.min(99, Math.max(0, Number(state.page) > 1 ? 25 : 0)), note: state.note || null }).catch(() => undefined);
  }, [item, state, isAuthenticated]);

  useEffect(() => {
    if (!item || !learnerState.data) return;
    const serverState = learnerState.data.readerState.find((entry) => entry.resourceId === item.id);
    const serverBookmarks = learnerState.data.bookmarks.filter((entry) => entry.resourceId === item.id).map((entry) => String(entry.page));
    const serverHighlights = learnerState.data.highlights.filter((entry) => entry.resourceId === item.id).map((entry) => ({ quote: entry.quote, page: String(entry.page), note: entry.note ?? "" }));
    if (serverState || serverBookmarks.length || serverHighlights.length) {
      setState((current) => ({ ...current, page: serverState ? String(serverState.currentPage) : current.page, note: serverState?.note ?? current.note, read: serverState ? Number(serverState.progressPercent) >= 100 : current.read, bookmarks: serverBookmarks.length ? serverBookmarks : current.bookmarks, highlights: serverHighlights.length ? serverHighlights : current.highlights }));
    }
  }, [item, learnerState.data]);

  useEffect(() => {
    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  if (!item) return <Shell><main className="reader-page"><div className="reader-not-found"><FileText size={30} /><h1>Source not found.</h1><Link href="/resources">Return to the reading room <ArrowUpRight size={15} /></Link></div></main></Shell>;
  const set = (patch: Partial<ReaderState>) => setState((current) => ({ ...current, ...patch }));
  const saveBookmark = async () => {
    const page = state.page;
    const exists = state.bookmarks.includes(page);
    set({ bookmarks: exists ? state.bookmarks.filter((value) => value !== page) : [...state.bookmarks, page] });
    if (!isAuthenticated) return;
    try {
      if (exists) await removeBookmark.mutateAsync({ resourceId: item.id, page: Number(page) || 1 });
      else await addBookmark.mutateAsync({ resourceId: item.id, page: Number(page) || 1, label: `Page ${page}` });
    } catch { toast.error("Bookmark saved locally; account sync will retry later."); }
  };
  const saveHighlight = async () => {
    const quote = highlightDraft.trim();
    const note = annotationDraft.trim();
    if (!quote) return;
    const entry = { quote, page: state.page, note };
    set({ highlights: [...state.highlights, entry] });
    setHighlightDraft("");
    setAnnotationDraft("");
    if (!isAuthenticated) return;
    try { await addHighlight.mutateAsync({ resourceId: item.id, page: Number(state.page) || 1, quote, note: note || null }); }
    catch { toast.error("Annotation saved locally; account sync will retry later."); }
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await readerRef.current?.requestFullscreen();
    } catch { toast.error("Full-screen mode is not available in this browser."); }
  };
  const sourceUrl = `${item.url}${item.url.includes(".pdf") ? `#page=${state.page}` : ""}`;
  return <Shell><main className={`reader-page ${state.dark ? "reader-page-dark" : ""}`}>
    <div className="reader-breadcrumb"><Link href="/resources"><ArrowLeft size={14} /> Reading room</Link><span>/</span><span>{item.topic}</span><span>/</span><b>{item.title}</b></div>
    <section className="reader-layout"><div className="reader-main">
      <div className="reader-heading"><p className="eyebrow"><span className="lime-dot" /> OPEN SOURCE / READING ROOM</p><h1>{item.title}</h1><p>{item.note}</p></div>
      <div className="reader-toolbar"><label><span>CONTINUE AT PAGE</span><input aria-label="Current page" type="number" min="1" value={state.page} onChange={(event) => set({ page: event.target.value || "1" })} /></label><div className="reader-control-group"><button aria-label="Zoom out" title="Zoom out" onClick={() => set({ zoom: Math.max(70, state.zoom - 10) })}><Minus size={14} /></button><strong>{state.zoom}%</strong><button aria-label="Zoom in" title="Zoom in" onClick={() => set({ zoom: Math.min(150, state.zoom + 10) })}><Plus size={14} /></button></div><button onClick={() => set({ dark: !state.dark })}>{state.dark ? <Sun size={15} /> : <Moon size={15} />} {state.dark ? "Light reader" : "Dark reader"}</button><button onClick={() => void toggleFullscreen()}>{isFullscreen ? <X size={15} /> : <Maximize2 size={15} />} {isFullscreen ? "Exit full-screen" : "Full-screen"}</button><button onClick={saveBookmark} className={state.bookmarks.includes(state.page) ? "active" : ""}><Bookmark size={15} /> {state.bookmarks.includes(state.page) ? "Bookmarked" : "Bookmark page"}</button><button onClick={() => set({ read: !state.read })} className={state.read ? "active" : ""}><Check size={15} /> {state.read ? "Read" : "Mark read"}</button></div>
      <div ref={readerRef} className={`pdf-reader-frame ${state.dark ? "is-dark" : ""}`}><div className="pdf-reader-viewport" style={{ zoom: `${state.zoom}%` }}><iframe title={`Source reader for ${item.title}`} src={sourceUrl} /></div><div className="reader-fallback"><FileText size={18} /> If the source does not embed, <a href={item.url} target="_blank" rel="noreferrer">open the original</a>.</div><div className="reader-overlay-label"><Focus size={13} /> {state.zoom}% / {state.dark ? "DARK" : "LIGHT"} / {isFullscreen ? "FULL-SCREEN" : "INLINE"}</div></div>
      <div className="reader-actions"><a href={item.url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open original source</a><a href={item.url} target="_blank" rel="noreferrer"><Download size={15} /> Source download</a><span><Save size={15} /> {isAuthenticated ? "Synced to your account" : "Saved privately in this browser"}</span></div>
      <div className="reader-tools-grid"><section className="reader-tool-card"><div className="aside-label"><Highlighter size={14} /> HIGHLIGHTS + ANNOTATIONS</div><p>Capture the sentence, then write the implication in your own words.</p><div className="highlight-input"><input placeholder="Paste a key sentence..." value={highlightDraft} onChange={(event) => setHighlightDraft(event.target.value)} /><button onClick={() => void saveHighlight()}>Save excerpt</button></div><textarea className="annotation-input" placeholder="Add a private annotation (optional)..." value={annotationDraft} onChange={(event) => setAnnotationDraft(event.target.value)} /><small>{isAuthenticated ? "Annotations sync to your account." : "Annotations are saved privately in this browser."}</small>{state.highlights.length ? <div className="saved-highlights">{state.highlights.map((highlight, index) => <article className="saved-highlight" key={`${highlight.quote}-${index}`}><blockquote>{highlight.quote}</blockquote><div><span>PAGE {highlight.page}</span>{highlight.note && <p><MessageSquare size={12} /> {highlight.note}</p>}</div></article>)}</div> : <small>No highlights yet.</small>}</section><section className="reader-tool-card"><div className="aside-label"><MessageSquare size={14} /> READING NOTE</div><p>Leave yourself one sentence about what to try next.</p><textarea placeholder="What should you remember?" value={state.note} onChange={(event) => set({ note: event.target.value.slice(0, 280) })} /><small>{state.note.length}/280 characters · {isAuthenticated ? "syncs to account" : "auto-saved locally"}</small></section></div>
    </div><aside className="reader-aside"><div className="reader-fact"><span className="aside-label"><FileText size={14} /> DOCUMENT CARD</span><h2>{item.topic}</h2><dl><div><dt>AUTHOR</dt><dd>{item.author}</dd></div><div><dt>INSTITUTION</dt><dd>{item.institution}</dd></div><div><dt>LEVEL</dt><dd>{item.level}</dd></div><div><dt>EST. READ</dt><dd>{item.readTime}</dd></div></dl></div><div className="reader-fact"><span className="aside-label"><Bookmark size={14} /> YOUR PLACE</span><p>Continue at page <strong className="reader-page-number">{state.page}</strong>. {state.bookmarks.length ? `${state.bookmarks.length} bookmark${state.bookmarks.length > 1 ? "s" : ""} saved.` : "Bookmark important pages as you go."}</p><button className="reader-course-link" onClick={() => document.querySelector(".pdf-reader-frame")?.scrollIntoView({ behavior: "smooth" })}>Jump to reader <ArrowUpRight size={14} /></button></div><div className="reader-fact"><span className="aside-label"><ArrowUpRight size={14} /> CONTINUE PATH</span><p>Read for the concept, then return to the course for the experiment.</p><Link className="reader-course-link" href={`/course/${item.relatedCourse}`}>Open related course <ArrowUpRight size={14} /></Link></div><div className="reader-fact"><span className="aside-label">TAGS</span><div className="reader-tags">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></div></aside></section>
  </main></Shell>;
}
