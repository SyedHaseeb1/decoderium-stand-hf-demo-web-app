# 14. Open Questions for the Client

Owner: the project lead, unless noted. Answers update the relevant doc and close the matching TASKS item.

| ID | Question | Why it matters | Source | Status |
|----|----------|----------------|--------|--------|
| Q-01 | What are the valid ranges for HR, BP, weight, LVEF and 1MSTS? | Validation rules | `[PROP §4]` | Open |
| Q-02 | SSO, local accounts, or both? Is MFA required? | Auth design | `[PROP §4]` | Open |
| Q-03 | Are due-date reminders in-app only, or also email or SMS? | Scope; SMS and email are out of scope in the FSD | `[PROP §4] [FSD §6]` | Open |
| Q-04 | Can patients be edited or deleted after sync, and by whom? | Audit and permissions | `[PROP §4]` | Open |
| Q-05 | Retention and deletion policy for withdrawn consent | Data protection | `[PROP §4]` | Open |
| Q-06 | Can a coordinator be assigned to more than one site? | Access model | `[FSD §2.1]` vs `[BRIEF s7]` | Open |
| Q-07 | Are the Data Manager and Read-only roles site-scoped? | Access model | `[BRIEF s7]` vs `[FSD §2.1]` | Open |
| Q-08 | Should the audit trail be in Phase 1, or moved to future scope as the FSD says? | Scope, price, timeline | `[BRIEF s9] [PROP]` vs `[FSD §3]` | Open |
| Q-09 | Offline in the pilot, or in v1.1? | Pilot scope and date | Team decision | Open |
| Q-10 | Is the FSD price (PKR 512,500) indicative or final? | Budget | `[FSD §8]` | Open |
| Q-11 | Is ethics approval in place for the registry and the electronic system? | Go-live gate | Not in documents | Open |
| Q-12 | Is 21 CFR Part 11 validation required? | Compliance scope | `[FSD §7]` | Open |
| Q-13 | Are dashboards Phase 2 only, or is any part needed in the pilot? | Scope | `[FSD §3]` vs `[BRIEF s9]` | Open |
| Q-14 | Which pilot sites and how many users? | Rollout | Not in documents | Open |
| Q-15 | Does a native app wrapper (APK or iOS) need to be on the table? | Distribution, MDM | Team question | Open |
| Q-16 | Is the drug dropdown list fixed, and who maintains it? | GDMT data | `[BRIEF s6]` | Open |
| Q-17 | Visit windows (3M day 90 ±14, 6M day 180 ±21) confirmed? | Due dates | `[PROTO]` | Open |
| Q-18 | Inclusion criteria: LVEF cutoff and minimum age | Validation | `[PROTO]` | Open |
| Q-19 | Contact number format (country code, length) | Patient form | UI change | Open |
| Q-20 | Prescription files: allowed types, size limit, number per visit, retention, who can delete, whether file views are audited | Upload | UI change | Open |
| Q-21 | Where prescription files are stored, and encryption and hosting for personal data | Security, hosting | UI change | Open |

## Internal decisions (not for the client)

- D-01: frontend framework (see [04-architecture.md](04-architecture.md))
- D-05: hosting provider
- FSD sign-off: do not sign until the gaps in Q-06 to Q-08 and the offline scope are fixed.
