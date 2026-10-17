# 09. Security and Compliance

## Security controls

| Control | Requirement | Source |
|---------|-------------|--------|
| HTTPS for all traffic | Required | `[BRIEF s8] [FSD §2.2]` |
| Encrypted local storage for offline drafts | Required; FSD says "where feasible," which conflicts with the brief | `[BRIEF s8]` vs `[FSD §2.2]`, see open questions |
| Role-based and site-scoped access on every API endpoint | Required | `[FSD §2.2]` |
| Password policy | Required (exact rules TBC) | `[FSD §2.2]` |
| Account lockout after failed logins | Required (threshold TBC) | `[FSD §2.2]` |
| JWT session | Required; expiry TBC | `[FSD §2.2]` |
| SSO or local accounts | TBC | `[PROP §4]` |
| MFA | TBC | `[PROP §4]` |
| Audit trail for corrections | Required | `[BRIEF s9]` |
| Password reset by Super Admin | Required | `[FSD §2.8]` |
| Deactivate users, not delete | Required | `[FSD §2.8]` |
| SSL certificate | Let's Encrypt or cloud-included | `[FSD §5.1]` |

## Data protection

- Patient data is clinical research data. Only synthetic data may be used in development and test.
- Consent withdrawal: retention or deletion policy is not defined (TBC) `[PROP §4]`.
- Patient name, contact number and prescription files are personal data (UI change). Store files encrypted, limit access by site, and audit every upload and view.
- Edit and delete rules after sync: not defined (TBC) `[PROP §4]`.

## Compliance

- Ethics approval for the registry and the electronic system: **not confirmed in the documents** (TBC). Check before any real patient data is entered.
- Data-protection requirements for Pakistan and any cross-border hosting: TBC.
- 21 CFR Part 11 validation: not included unless separately requested `[FSD §7]`. Confirm with the client whether it applies.
- Security and privacy follow "reasonable clinical-research standards" `[FSD §7]`. Define these with the client.

## Security reviews

- Code review of authentication and access control before pilot.
- Dependency scan before each release.
- Penetration test before full rollout (TBC, budget needed).

## Tasks

See SEC-* in [TASKS.md](TASKS.md).
