# 12. Deployment and Operations

Source: `[PROP]` (dedicated hosting server and domain), `[FSD §5]`, `[FSD §7]`.

## Hosting

- **Production:** cloud VM or managed service on Azure or AWS (TBC `D-05`). Not a developer machine.
- **Managed PostgreSQL** `[FSD §5.2]`.
- **Domain and SSL:** domain required; SSL via Let's Encrypt or the cloud host `[FSD §5.1]`.
- **Capacity:** about 100 sites `[FSD §5.2]`.

## Environments

See [04-architecture.md](04-architecture.md): local dev, test or staging, pilot (production).

## Backups and recovery

- Daily database backups, kept for at least 30 days (TBC).
- Restore test before pilot go-live.
- Backups encrypted at rest.

## Releases and patches

- Versioning: `major.minor.patch` (for example, 1.0.0 pilot, 1.1.0 offline, 1.0.1 patch).
- Patches: bug fixes and small changes. No schema changes without a migration script.
- Release notes for every version, shared with the client.
- Rollback plan for each release.
- Schedule releases outside clinic hours (TBC).

## Monitoring

- Uptime check on the login page.
- Error logging on the API.
- Failed-login alerts for the Super Admin.

## Access

- Production access limited to named engineers.
- Secrets stored in the cloud secret store, not in source code.

## Tasks

See DEP-* in [TASKS.md](TASKS.md).
