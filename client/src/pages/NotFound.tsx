import { ArrowLeft, Compass, Home, Radio } from "lucide-react";
import { Link } from "wouter";
import { Shell } from "@/components/AcademyShell";

export default function NotFound() {
  return (
    <Shell>
      <main className="not-found-page">
        <div className="not-found-grid" />
        <section className="not-found-panel">
          <div className="not-found-signal"><Radio size={18} /></div>
          <p className="eyebrow"><span className="lime-dot" /> RAMPAGE / ROUTE CONTROL</p>
          <div className="not-found-code">404 <span>/ SIGNAL LOST</span></div>
          <h1>This route is<br /><em>not indexed.</em></h1>
          <p className="not-found-copy">The page is not part of the current curriculum map. Return to the academy, choose a guided path, or use search to pick up a known lesson.</p>
          <div className="not-found-actions">
            <Link className="primary-cta" href="/"><Home size={15} /> Return to academy</Link>
            <Link className="secondary-cta" href="/paths"><Compass size={15} /> Browse guided paths</Link>
          </div>
          <div className="not-found-footer"><Link href="/learn"><ArrowLeft size={14} /> My learning</Link><span>STATUS / ROUTE NOT FOUND · CURRICULUM INTACT</span></div>
        </section>
      </main>
    </Shell>
  );
}
