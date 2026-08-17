import { ArrowUpRight, BookOpen, ExternalLink, Layers3, Play, ShieldCheck, Target, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { courses, resourceCatalog, spotlightCourse } from "@/data/catalog";
import { Shell } from "@/components/AcademyShell";

const courseBadge = (status: string) => status === "SPOTLIGHT" ? "FLAGSHIP PATH" : status === "COMING SOON" ? "BUILDING NEXT" : status === "GUIDED COURSE" ? "STRUCTURED ROUTE" : "DEEP RESEARCH";

const facultySources = [
  { name: "MIT OpenCourseWare", slug: "mit", domain: "mit.edu", note: "systems + computation" },
  { name: "Stanford Engineering", slug: "stanford", domain: "stanford.edu", note: "networks + infrastructure" },
  { name: "UC Berkeley", slug: "berkeley", domain: "berkeley.edu", note: "systems + research" },
  { name: "UMass Amherst", slug: "umass", domain: "umass.edu", note: "networking foundations" },
  { name: "Carnegie Mellon", slug: "carnegiemellon", domain: "cmu.edu", note: "operating systems + architecture" },
  { name: "Princeton", slug: "princeton", domain: "princeton.edu", note: "algorithms + theory" },
  { name: "Georgia Tech", slug: "georgiatechnology", domain: "gatech.edu", note: "computing systems" },
  { name: "University of Waterloo", slug: "uwaterloo", domain: "uwaterloo.ca", note: "software + security" },
  { name: "University of Oxford", slug: "oxford", domain: "ox.ac.uk", note: "formal methods + computing" },
  { name: "ETH Zürich", slug: "ethz", domain: "ethz.ch", note: "distributed systems + engineering" },
];

const companySignals = [
  { name: "Google", slug: "google", lens: "distributed systems" },
  { name: "Microsoft", slug: "microsoft", lens: "cloud platforms" },
  { name: "NVIDIA", slug: "nvidia", lens: "accelerated computing" },
  { name: "Amazon", slug: "amazon", lens: "reliable services" },
  { name: "Oracle", slug: "oracle", lens: "data infrastructure" },
  { name: "Cisco", slug: "cisco", lens: "network architecture" },
  { name: "Cloudflare", slug: "cloudflare", lens: "internet reliability" },
  { name: "Red Hat", slug: "redhat", lens: "open infrastructure" },
  { name: "Datadog", slug: "datadog", lens: "observability" },
  { name: "OpenAI", slug: "openai", lens: "model systems" },
];

function SourceLogo({ slug, name }: { slug: string; name: string }) {
  const [src, setSrc] = useState<string>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const url = `https://api.iconify.design/simple-icons/${slug}.svg?color=%23ffffff`;
    const load = async () => {
      try {
        if (typeof window !== "undefined" && "caches" in window) {
          const cache = await caches.open("rampage-logo-rail-v1");
          const request = new Request(url, { mode: "cors" });
          const cached = await cache.match(request);
          const response = cached || await fetch(request, { mode: "cors" });
          if (!cached && response.ok) await cache.put(request, response.clone());
          if (response.ok && active) setSrc(URL.createObjectURL(await response.blob()));
        } else if (active) setSrc(url);
      } catch {
        if (active) setFailed(true);
      }
    };
    void load();
    return () => { active = false; };
  }, [slug]);
  return <div className={failed || !src ? "rail-logo-frame rail-logo-fallback" : "rail-logo-frame"}><img className="rail-logo" src={src} alt={`${name} logo`} loading="lazy" decoding="async" onError={() => setFailed(true)} /><span>{name.split(" ").map((word) => word[0]).join("").slice(0, 3)}</span></div>;
}

function LogoRail({ items, kind }: { items: Array<{ name: string; slug: string; note?: string; lens?: string }>; kind: "faculty" | "company" }) {
  const loop = [...items, ...items];
  return <div className={`logo-rail ${kind}-rail`} aria-label={kind === "faculty" ? "Academic source ecosystems" : "Technical company reference points"}><div className="logo-rail-track">{loop.map((item, index) => <div className="rail-item" key={`${item.slug}-${index}`}><SourceLogo slug={item.slug} name={item.name} /><div><strong>{item.name}</strong><small>{item.note || item.lens}</small></div></div>)}</div></div>;
}

export default function Home() {
  return <Shell><main className="academy-home">
    <section className="academy-hero"><div className="hero-copy"><p className="eyebrow"><span className="lime-dot" /> BLACKVAULT ACADEMY / OPEN CURRICULUM</p><div className="hero-lockup"><span>BLACKVAULT</span><b>/ RAMPAGE</b></div><h1>Learn the systems<br /><em>behind the surface.</em></h1><p className="hero-intro">A high-signal learning environment for people who want to understand how computers actually work — through courses, labs, lectures, papers, and projects worth finishing.</p><div className="hero-actions"><Link className="primary-cta" href="/course/ai-systems">Enter the AI spotlight course <ArrowUpRight size={18} /></Link><Link className="text-cta" href="/resources">Browse the resource graph <ArrowUpRight size={16} /></Link></div></div><div className="hero-rail"><span>CURATED / OPEN / SERIOUS</span><strong>01<br />COURSE<br /><i>IN FOCUS</i></strong><small>02—∞<br />NEXT PATHS IN BUILD</small></div></section>
    <section className="academy-intro"><div className="section-index">01 <span>/</span> THE ACADEMY</div><div><h2>Not a course shelf.<br /><i>A learning system.</i></h2><p>Rampage connects structured paths to the original lectures, labs, repositories, books, and papers that make the work real. The interface stays calm. The standard stays high.</p></div><div className="intro-signals"><span><Layers3 size={18} /> DATA-DRIVEN</span><span><ShieldCheck size={18} /> LOCAL PROGRESS</span><span><BookOpen size={18} /> OPEN RESOURCES</span></div></section>
    <section className="spotlight spotlight--ai"><div className="section-heading"><div><div className="section-index">02 <span>/</span> AI SYSTEMS IN FOCUS</div><h2>{spotlightCourse.title}<br /><i>{spotlightCourse.subtitle}</i></h2></div><Link className="text-cta" href={`/course/${spotlightCourse.id}`}>Open course map <ArrowUpRight size={16} /></Link></div><div className="spotlight-grid"><div className="spotlight-card"><div className="spotlight-index">00—05</div><div className="spotlight-art"><div className="art-core"><Play size={22} fill="currentColor" /></div></div><div className="spotlight-card-bottom"><span>GATEKEEPER PATH</span><strong>Write the shell.<br />Build the CPU.<br />Extend the kernel.</strong></div></div><div className="spotlight-copy"><p>{spotlightCourse.description}</p><div className="course-metrics"><div><strong>{spotlightCourse.phases.length}</strong><span>PHASES</span></div><div><strong>{spotlightCourse.phases.reduce((sum, phase) => sum + phase.lessons.length, 0)}+</strong><span>LESSONS</span></div><div><strong>{spotlightCourse.time.split(" ")[0]}</strong><span>HOURS+</span></div></div><div className="source-strip"><span>BUILT FROM</span><b>{spotlightCourse.sourceLabel}</b><ExternalLink size={14} /></div></div></div></section>
    <section className="catalog" id="catalog"><div className="catalog-head"><div><div className="section-index">03 <span>/</span> THE CATALOG</div><h2>Paths in motion.</h2></div><p>Every course is a front door into a deeper network of resources. The catalog is designed to grow without redesigning the product.</p></div><div className="course-grid">{courses.map((course, index) => <Link key={course.id} href={course.phases.length ? `/course/${course.id}` : "/resources"} className={`course-card ${course.status === "SPOTLIGHT" ? "featured" : ""}`}><div className="course-card-top"><span>{String(index + 1).padStart(2, "0")}</span><span className={course.status === "SPOTLIGHT" ? "status-live" : "status-soon"}>{course.status}</span></div><div className="course-card-badge">{courseBadge(course.status)}</div><h3>{course.title}</h3><p>{course.subtitle}</p><div className="course-card-details"><span>{course.level}</span><span>{course.phases.length ? `${course.phases.reduce((sum, phase) => sum + phase.lessons.length, 0)} lessons` : "Curriculum in build"}</span></div><div className="course-card-foot"><span>{course.time}</span><ArrowUpRight size={17} /></div></Link>)}</div></section>
    <section className="provenance-section" id="sources"><div className="section-index">04 <span>/</span> RESOURCE PROVENANCE</div><div className="provenance-head"><div><h2>Learn from the<br /><i>source layer.</i></h2><p>Rampage turns public lectures, labs, papers, and course notes into a sequence you can actually follow. The marks below identify institutions represented in the resource graph. They are references, not partners.</p></div><div className="provenance-mark">OPEN<br /><span>↘</span><br />SOURCES</div></div><LogoRail items={facultySources} kind="faculty" /><div className="rail-caption"><span>REFERENCE ECOSYSTEMS / 10 SOURCES</span><Link className="text-cta" href="/resources">See the source graph <ArrowUpRight size={15} /></Link></div></section>
    <section className="company-section" id="readiness"><div className="section-index">05 <span>/</span> TECHNICAL READINESS</div><div className="company-head"><div><h2>Build for the<br /><i>hard problems.</i></h2><p>We study the kinds of systems problems that show up in infrastructure, cloud, networks, compute, data, and reliability work. These company marks are reference points for technical domains — not endorsements, partnerships, or hiring promises.</p></div><div className="company-signal"><Target size={20} /><span>SKILLS OVER<br />SIGNALS</span></div></div><LogoRail items={companySignals} kind="company" /><div className="rail-caption"><span>TECHNICAL DOMAINS / REFERENCE ONLY</span><Link className="text-cta" href="/paths">Choose a guided path <ArrowUpRight size={15} /></Link></div></section>
    <section className="path-teaser"><div><div className="section-index">06 <span>/</span> GUIDED PATHS</div><h2>Start with a route.<br /><i>Not a search box.</i></h2><p>Choose the goal that sounds like you. Rampage turns the best open material into a calm sequence with one next action.</p></div><div className="path-teaser-actions"><Link className="primary-cta" href="/paths">Explore guided paths <ArrowUpRight size={18} /></Link><Link className="text-cta" href="/course/ai-systems">Start AI Systems <ArrowUpRight size={16} /></Link></div></section>
    <section className="resource-teaser"><div className="section-index">07 <span>/</span> RESOURCE GRAPH</div><h2>The best material<br /><i>already exists.</i></h2><div className="resource-teaser-bottom"><p>We make it findable, contextual, and usable in a deliberate sequence. Explore the original sources behind the paths.</p><Link className="primary-cta" href="/resources">Open resource library <ArrowUpRight size={18} /></Link><div className="resource-count"><strong>{resourceCatalog.length.toString().padStart(2, "0")}</strong><span>VERIFIED<br />STARTING NODES</span></div></div></section>
    <section className="foundation-section"><div className="foundation-stamp"><WalletCards size={20} /><span>BLACKVAULT<br />FOUNDATION</span></div><div className="foundation-copy"><div className="section-index">08 <span>/</span> THE FOUNDATION</div><h2>Serious learning<br /><i>should stay reachable.</i></h2><p>BlackVault Foundation exists to make structured technical learning more affordable and more navigable. The mission is simple: provide a structural way to learn, with high-quality sources, clear progression, and no unnecessary complexity.</p><div className="foundation-values"><span>STRUCTURE</span><span>ACCESS</span><span>DISCIPLINE</span></div></div><div className="founder-card"><div className="founder-kicker">OUR FOUNDER</div><strong>Adarsh Kushwah</strong><span>AI Engineer &amp; Developer</span><p>Founder-provided credential note: Oracle-certified and certified by the Government of India. Credential details are presented as provided by the founder.</p><Link className="text-cta" href="/about">Read the Foundation story <ArrowUpRight size={16} /></Link></div></section>
  </main></Shell>;
}

export { facultySources, companySignals };
