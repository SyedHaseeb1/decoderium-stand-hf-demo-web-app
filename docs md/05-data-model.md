# 05. Data Model (Draft)

Draft for design review. Field names are proposals. Relational integrity is required `[FSD §1.3]`.

## Entities

### Site
| Field | Type | Notes |
|-------|------|-------|
| SiteId | int, PK | |
| SiteCode | string, unique | For example "RIC", "LHR". Used in the Study ID. |
| SiteName | string | |
| IsActive | bool | Deactivated, not deleted |

### User
| Field | Type | Notes |
|-------|------|-------|
| UserId | int, PK | |
| Username | string, unique | |
| PasswordHash | string | ASP.NET Identity |
| Role | enum | Super Admin, PI/Central, Site Coordinator, Data Manager, Read-only |
| IsActive | bool | |
| LastLoginAt | datetime | |

### UserSite (join)
| Field | Type | Notes |
|-------|------|-------|
| UserId, SiteId | FK | Composite key. Site users have one or more rows. |

### Patient
| Field | Type | Notes |
|-------|------|-------|
| PatientId | guid, PK | Internal key |
| StudyId | string, unique | Auto-generated from site code and sequence `[PROTO] [BRIEF s4]` |
| SiteId | FK | |
| InvestigatorName | string | |
| PatientName | string | Required. New field from the UI change |
| ContactNumber | string | Required. Format TBC (Q-19). New field from the UI change |
| ConsentDate | date, required | `[PROP §2]` |
| Age | int | Validation: 18 or more `[PROTO]` TBC |
| Sex | enum | Male, Female |
| HfEtiology | enum | Ischemic, Non-ischemic, Other |
| EtiologyOther | string, nullable | |
| CreatedBy, CreatedAt | | |

### Visit
| Field | Type | Notes |
|-------|------|-------|
| VisitId | guid, PK | |
| PatientId | FK | |
| VisitType | enum | Baseline, M3, M6 |
| VisitDate | date | Handled automatically (defaults to consent date for Baseline) |
| WeightKg | decimal | |
| HeartRate | int | |
| SystolicBp, DiastolicBp | int | |
| NyhaClass | enum | I, II, III, IV |
| Msts1Reps | int | 1MSTS repetitions in 60 seconds |
| Msts1StopReason | enum, nullable | Prototype list |
| LvefPercent | int, nullable | Baseline and M6 only (moved to main Section B grid) `[E-CRF Changes p.3]` |
| IsCompleted | bool | Locks the visit |
| InvestigatorInitials | string | |
| Version | int | For sync and concurrency (v1.1) |

### GdmtEntry
| Field | Type | Notes |
|-------|------|-------|
| GdmtEntryId | guid, PK | |
| VisitId | FK | |
| Pillar | enum | Arni, BetaBlocker, Mra, Sglt2i |
| GenericDrugId | FK | Dropdown from drug master table `[E-CRF Changes p.6]` |
| Strength | string | Dropdown per generic drug (e.g. 25mg, 50mg) `[E-CRF Changes p.5,6]` |
| Frequency | enum | OD, BD, TDS `[E-CRF Changes p.5,6]` |
| DailyDose | string, computed | Legacy string e.g. "50mg BD" synced for backward compat |
| Status | enum | Active, Not started, Stopped (auto-selected as Active on drug selection) |
| Note | string, nullable | |

Active pillar score = count of pillars with status Active at that visit `[BRIEF s6]`.

### IncompleteReason
| Field | Type | Notes |
|-------|------|-------|
| VisitId, Pillar, ReasonCode | | Codes from `[BRIEF s6]`, plus "Other" `[FSD §2.5]` |

### Event
| Field | Type | Notes |
|-------|------|-------|
| EventId | guid, PK | |
| VisitId | FK | Only M3 and M6 `[BRIEF s5]` |
| HfHospitalization | bool | |
| OtherHospitalization | bool | |
| Death | bool | |
| MajorIntervention | string, nullable | Free text `[FSD §2.6]` |

### DrugMaster
| Field | Type | Notes |
|-------|------|-------|
| DrugId | int, PK | |
| GenericName | string | Dropdown source `[BRIEF s6]` |
| Pillar | enum | |
| IsActive | bool | |

### AuditLog
| Field | Type | Notes |
|-------|------|-------|
| AuditId | bigint, PK | Append-only |
| EntityType, EntityId | string, guid | |
| FieldName | string | |
| OldValue, NewValue | string | |
| ChangedBy | FK User | |
| ChangedAt | datetime | |
| Reason | string, required | `[BRIEF s9]` |

### VisitAttachment
| Field | Type | Notes |
|-------|------|-------|
| AttachmentId | guid, PK | |
| VisitId | FK | One visit can have many files. Prescription upload on Baseline, 3M and 6M |
| FileName | string | Original name, shown in the record |
| ContentType | string | application/pdf, image/jpeg or image/png only |
| SizeBytes | bigint | Limit per file TBC (Q-20) |
| StorageKey | string | Location in the file store. Not a public URL |
| UploadedBy, UploadedAt | FK, datetime | Recorded in the audit trail as well |

## Notes

- The audit log is append-only. Application code must never update or delete rows in it.
- Build the audit table in the pilot even if the UI is basic. Adding it later leaves gaps.
- Sync fields (sync status, record version) are added in v1.1 with a migration. Plan the Version column now.
