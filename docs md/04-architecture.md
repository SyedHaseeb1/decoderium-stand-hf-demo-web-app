# 04. Architecture and Technology

## Proposed stack

| Layer | Choice | Status | Notes |
|-------|--------|--------|-------|
| Backend API | ASP.NET Core Web API (.NET 8) | Proposed | `[FSD §1.3] [PROP]`. Strong RBAC, validation and EF Core. |
| Database | PostgreSQL | Proposed | `[FSD §1.3]`. SQL Server is the alternative. |
| Data access | Entity Framework Core | Proposed | Migrations for schema changes |
| Auth | ASP.NET Core Identity with JWT | TBC | Pending the SSO/local and MFA decision |
| Frontend | **Undecided**: Blazor WebAssembly PWA (FSD), Angular (team option), or React (proposal) | Decision D-01 | See below |
| Offline store | IndexedDB (v1.1) | Planned | Encrypted drafts |
| Export | ClosedXML or EPPlus (XLSX), CsvHelper (CSV) | Proposed | `[FSD §1.3]` |
| Hosting | Cloud VM or managed service (Azure or AWS) | TBC | `[PROP]` says Azure or AWS |

## Decision D-01: frontend framework

| Option | Pros | Cons |
|--------|------|------|
| Blazor WebAssembly | C# shared with backend; one language; the FSD already chose it | Larger first download; fewer offline examples |
| Angular | Structure; reactive forms suit data entry; official PWA support | Heavier; more boilerplate |
| React | Most offline tooling and examples; largest community | Two languages; validation rules duplicated |

**Status:** open. Decide based on team skills. Record the outcome here and in [TASKS.md](TASKS.md) as ARC-01.

## Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| Local dev | Development on developer machines | Synthetic only |
| Test / staging | QA and UAT | Synthetic only |
| Pilot (production) | Live pilot sites | Real patient data, after approvals |

Rules:
- No real patient data outside the production environment.
- Developer machines are not hosts for production. See [12-deployment-ops.md](12-deployment-ops.md).

## Local development setup (this machine, checked Oct 9, 2026)

- .NET SDK 8.0.131: installed
- Node 20.20.2 with npm and yarn: installed
- Git 2.55.0, GitHub CLI (authenticated), VS Code: installed
- PostgreSQL client `psql` 18: installed. **Server not installed yet.**
- Docker: not installed (optional)
- Disk: `/home` at 92% with 17 GB free. Clear space before installing more.

## Technical decisions log

| ID | Decision | Status | Date |
|----|----------|--------|------|
| D-01 | Frontend framework | Open | - |
| D-02 | Backend: ASP.NET Core (.NET 8) | Proposed | 2026-10-09 |
| D-03 | Database: PostgreSQL | Proposed | 2026-10-09 |
| D-04 | Auth mechanism | Open (client) | - |
| D-05 | Hosting provider | Open | - |
