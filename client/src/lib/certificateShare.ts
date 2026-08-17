export function buildCertificateShareUrls(courseTitle: string, certificateUrl: string) {
  return {
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I completed ${courseTitle} through BlackVault Rampage.`)}&url=${encodeURIComponent(certificateUrl)}`,
  };
}

export function buildCertificateShareText(courseTitle: string, certificateUrl: string) {
  return `I completed ${courseTitle} through BlackVault Rampage. ${certificateUrl}`;
}
