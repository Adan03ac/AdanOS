# ADAN OS — Knowledge Universe: first local preview

## Implemented
- Expo Router navigation for Command Center, Library, Universe, Projects, Discovery, and Settings, with separate item/project editors and details.
- Real device-local records via AsyncStorage, initially empty. No mock records are used as primary data. Writes complete before shared state updates or success messages.
- Stable item, project, tag, and relationship IDs; timestamps; explicit ItemTag and ItemProject many-to-many tables.
- Item CRUD, project CRUD, tags, project linking/unlinking, directed relationship creation/removal, and destructive confirmation.
- Content/title search, type/status/tag/project filters, and creation/update/title sorting.
- Actual saved-node SVG graph with drag panning, button zoom, selection, direction arrows, and a complete relationship explorer. Circular positions do not imply semantic similarity. Canvas is capped at 60 matching nodes.
- Transparent discovery rules for unlinked items, no linked source, projects without next actions, and explicit shared context. Suggestions are bounded and only become edges after manual acceptance.
- Browser JSON download, cross-platform clipboard export, native JSON-text sharing, and validated paste-to-restore with merge or replace confirmation. No automatic backups or native file-picker workflow.
- Explicitly optional removable sample dataset. Persian/English content direction support; interface labels are English.
- In-app data-integrity checks for backup roundtrip, duplicate IDs, missing references, self-links, confidence, malformed JSON, and sample cleanup. These checks are in-memory and do not mutate user data.

## Verification status
- Code and mutation/validation paths were reviewed during implementation. There is no terminal, build, browser interaction, or device-test tool available in this session, so no successful build or end-to-end acceptance test is claimed.
- Run Settings → Run integrity checks to execute the included checks against the loaded data.
- Still requires runtime testing: create/edit/delete, refresh and new-session persistence, graph interactions, filtering, associations, backup export/reimport, clipboard/sharing, small-screen layout, and Persian content rendering.

## Restrictions and incomplete acceptance criteria
- Supabase is not connected; no cloud database, authentication, server-enforced authorization, multi-user isolation, or cross-device sync is implemented. This is a local preview, not the requested deployable database-backed MVP.
- Clearing local storage, private browsing, uninstalling, or changing browser/device may lose data. Export a manual backup regularly.
- The workspace uses React Native/Expo with a browser preview, not a standalone React web framework.
- Native file import/export uses paste and JSON text sharing as an explicitly disclosed alternative. Browser download only confirms a download request, not that the user retained the file.
- No AI, GitHub, Dropbox, Notion, external APIs, paid integrations, or automatic verification claims.

## Next stage
1. Verify the local value chain and backup restore in the preview and on a device.
2. Connect Supabase using OnSpace's connection control, then create database tables, authentication, and server-enforced access policies.
3. Migrate the local records while preserving IDs and join tables, and rerun end-to-end acceptance/security tests before deployment.
