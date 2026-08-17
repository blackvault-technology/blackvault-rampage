import { describe, expect, it } from "vitest";
import { buildCertificateShareText, buildCertificateShareUrls } from "./certificateShare";

describe("certificate sharing", () => {
  it("encodes LinkedIn and X share destinations without losing the certificate URL", () => {
    const urls = buildCertificateShareUrls("AI Systems & Evaluation", "https://rampage.example/certificate/ai-systems?record=abc");
    expect(urls.linkedIn).toContain("https://www.linkedin.com/sharing/share-offsite/?url=");
    expect(urls.linkedIn).toContain(encodeURIComponent("https://rampage.example/certificate/ai-systems?record=abc"));
    expect(urls.twitter).toContain(encodeURIComponent("I completed AI Systems & Evaluation through BlackVault Rampage."));
    expect(urls.twitter).toContain(encodeURIComponent("https://rampage.example/certificate/ai-systems?record=abc"));
  });

  it("keeps the copied share message human and explicit", () => {
    expect(buildCertificateShareText("Networking Systems", "https://rampage.example/certificate/networking")).toBe("I completed Networking Systems through BlackVault Rampage. https://rampage.example/certificate/networking");
  });
});
