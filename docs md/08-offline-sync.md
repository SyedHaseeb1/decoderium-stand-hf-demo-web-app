# 08. Offline and Sync (v1.1)

Not in the pilot. Planned for v1.1 after the pilot, or for Phase 1 full if the client insists on offline in v1 (6 to 8 weeks extra) `[see 13-timeline-phases.md]`.

## Requirement

The portal is fully functional online and offline. Flow: open patient, enter data offline, store an encrypted local draft, auto-sync when the connection returns `[BRIEF s8] [FR §9]`.

## Design

- **App shell:** service worker caches the application files so the app opens offline. The app can be installed to the tablet's home screen.
- **Local store:** IndexedDB holds drafts. Drafts are encrypted with the Web Crypto API before they are written.
- **Key management:** the encryption key must be derived from something the device and user control (for example, a PIN or the login session). If the key is lost, drafts are unreadable. Decision needed (TBC).
- **Sync queue:** each saved change joins a queue. Sync sends queued changes over HTTPS when online.
- **Sync status per record:** Synced, Pending Sync, Sync Failed `[BRIEF s8]`.
- **Conflict handling:** prevent duplicate records. When the same record changed on two devices, keep the latest verified version and log the other one in the audit trail `[BRIEF s8]`.

## Limits to plan for

- **Storage eviction:** browsers, especially iPad Safari, can clear local storage after inactivity or low disk space. Call `navigator.storage.persist()` to request persistent storage, and sync drafts early.
- **Offline login:** an expired session token blocks offline work. Define an offline session window (TBC).
- **No background sync on iOS Safari:** sync runs when the app is open.
- **Lost or stolen tablets:** support remote logout and a device-trust list (TBC).

## Tasks

See OFF-* in [TASKS.md](TASKS.md).

## Open decisions

- Encryption key source and recovery (TBC)
- Offline session length (TBC)
- Whether a native wrapper is needed for durable storage (see the earlier discussion; a wrapper is deferred until UAT on real tablets)
