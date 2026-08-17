import { ArrowLeft, ArrowUpRight, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Shell } from "@/components/AcademyShell";

type LegalKind = "terms" | "privacy" | "cookies" | "acceptable-use";
type LegalSection = { title: string; body: string[] };
type LegalDocument = { eyebrow: string; title: string; intro: string; updated: string; sections: LegalSection[] };

const documents: Record<LegalKind, LegalDocument> = {
  terms: { eyebrow: "LEGAL / TERMS", title: "Use the academy with intent.", intro: "These terms describe the ground rules for using BlackVault Rampage, its curated learning materials, and the account features that keep your work tied to you.", updated: "August 17, 2026", sections: [
    { title: "1. The service", body: ["BlackVault Rampage is an educational service operated by BlackVault Foundation. It organizes public technical resources into guided courses, lessons, labs, assessments, and learner records.", "Course completion, XP, badges, and digital certificates are educational records. They are not academic degrees, professional licenses, employment guarantees, or legal credentials."] },
    { title: "2. Your account", body: ["Keep your account details and password accurate and private. Do not share access, impersonate another learner, or create accounts to manipulate progress, assessment results, or certificates.", "You may request account closure through the contact channel published with your deployment. Records needed for security or legal compliance may be retained for a reasonable period."] },
    { title: "3. Learning materials", body: ["Rampage links to and describes materials created by original authors and institutions. Those sources keep their own rights and terms. Use each source according to its publisher’s license and policies.", "Do not scrape, resell, or republish the academy interface, private account data, or assessment answers."] },
    { title: "4. Assessments and certificates", body: ["Assessments use timing, focus, fullscreen, attempt, and account signals to support integrity, but no online system can promise impossible cheating prevention.", "A certificate is issued only when the server confirms the required lessons, chapters, and final assessment. An unissued certificate page is not a credential."] },
  ] },
  privacy: { eyebrow: "LEGAL / PRIVACY", title: "Keep the learner record yours.", intro: "This notice explains the account and learning data Rampage uses to save progress, protect assessments, and issue certificates only when required work is complete.", updated: "August 17, 2026", sections: [
    { title: "1. Data we use", body: ["We use the account details you provide, such as display name and email address, plus authentication records needed to sign you in and recover your account.", "When you learn, we may store lesson completion, reading position, bookmarks, notes, quiz submissions, assessment attempts, XP awards, integrity signals, and issued certificate records."] },
    { title: "2. Why we use it", body: ["Learning data powers your dashboard, resume states, quiz feedback, progress summaries, badges, and certificate eligibility. Security records help protect server-side scoring.", "We do not sell learner records. Source links may take you to third-party websites with their own privacy practices."] },
    { title: "3. Storage and protection", body: ["Passwords are stored as derived credentials rather than readable passwords, and session cookies are signed and scoped to the first-party application.", "No online service can promise perfect security. Keep your password private and contact the academy if you suspect unauthorized access."] },
  ] },
  cookies: { eyebrow: "LEGAL / COOKIES", title: "Small signals, useful continuity.", intro: "Rampage uses a limited set of browser storage mechanisms to keep the learning experience coherent. This page describes what they do and what they do not do.", updated: "August 17, 2026", sections: [
    { title: "1. Essential session cookies", body: ["The signed session cookie keeps a logged-in learner recognized between requests. It is essential for protected progress, assessments, account settings, and certificate gates.", "These cookies are not used to read your password or track you across unrelated websites."] },
    { title: "2. Local learning state", body: ["The app may use local browser storage for interface preferences, offline public-shell caching, reader position, bookmarks, and other continuity features. Offline caching excludes authenticated API responses and private account data."] },
    { title: "3. Your controls", body: ["You can clear cookies and local storage through your browser settings. Blocking essential cookies can prevent login and protected learning actions from working."] },
  ] },
  "acceptable-use": { eyebrow: "LEGAL / ACCEPTABLE USE", title: "Learn seriously. Leave the system stronger.", intro: "Rampage is built for careful study and practical work. These rules protect learners, source authors, assessment integrity, and the reliability of the academy.", updated: "August 17, 2026", sections: [
    { title: "1. Good-faith learning", body: ["Use the academy to study, experiment in lawful environments, document your work, and deepen your understanding. Respect course instructions, source licenses, institutional policies, and other learners."] },
    { title: "2. Do not abuse the service", body: ["Do not probe, overload, scrape, reverse engineer, bypass access controls, submit malicious payloads, or interfere with the academy, its database, its storage, or another learner’s account.", "Do not fabricate progress, replay assessments, harvest answer keys, or claim a certificate you have not earned."] },
    { title: "3. Responsible security practice", body: ["Security lessons are educational. Test only systems you own or have explicit permission to assess."] },
    { title: "4. Enforcement", body: ["We may pause or close accounts, invalidate compromised assessment attempts, or remove abusive content when needed to protect the learning environment."] },
  ] },
};

export default function Legal({ kind }: { kind: LegalKind }) {
  const document = documents[kind];
  return <Shell><main className="legal-page"><div className="legal-topline"><Link href="/" className="legal-back"><ArrowLeft size={15} /> Back to academy</Link><span>BLACKVAULT FOUNDATION / RAMPAGE</span></div><header className="legal-hero"><div><p className="eyebrow"><span className="signal-dot" /> {document.eyebrow}</p><h1>{document.title}</h1><p className="legal-intro">{document.intro}</p></div><div className="legal-hero-card"><ShieldCheck size={21} /><strong>Plain-language policy</strong><span>Last updated {document.updated}</span></div></header><div className="legal-layout"><aside className="legal-index"><p>ON THIS PAGE</p><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookies</Link><Link href="/acceptable-use">Acceptable use</Link><div className="legal-index-note"><FileText size={16} /><span>These pages explain the product boundary. They are not a substitute for legal advice.</span></div></aside><article className="legal-document"><div className="legal-document-meta"><LockKeyhole size={15} /> {document.updated} · BLACKVAULT FOUNDATION</div>{document.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<div className="legal-contact"><strong>Need a clarification?</strong><span>Use the contact channel published with your Rampage deployment and include the policy name in your message.</span><ArrowUpRight size={16} /></div></article></div></main></Shell>;
}

export function Terms() { return <Legal kind="terms" />; }
export function Privacy() { return <Legal kind="privacy" />; }
export function Cookies() { return <Legal kind="cookies" />; }
export function AcceptableUse() { return <Legal kind="acceptable-use" />; }
