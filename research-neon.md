# Rampage Neon Backend Notes

- Existing Neon project: `Rampage`
- Neon project ID: `nameless-rice-04413040`
- Database: `neondb`
- Region: `aws-ap-southeast-1`
- The project already contains the `neon_auth` schema tables.
- Public application tables created and verified: `users`, `rampage_users`, `rampage_progress`, `rampage_reader_state`, `rampage_reader_bookmarks`, `rampage_reader_highlights`, `rampage_certificates`, and `rampage_audit_events`.
- Connection credentials are intentionally not stored in this file. The server uses the secure `NEON_DATABASE_URL` environment variable.
- Certificate records are non-accredited digital completion records and are issued only through protected server procedures after the required lesson count is met.
