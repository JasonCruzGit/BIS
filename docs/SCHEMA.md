# Database Schema

## Entity Relationship Diagram

The database consists of 15 main entities:

1. **User** - System users and authentication
2. **Resident** - Resident information
3. **Household** - Household profiling
4. **Document** - Barangay documents
5. **Incident** - Incident and case reporting
6. **Project** - Barangay projects and programs
7. **Official** - Barangay officials and employees
8. **Attendance** - Official attendance tracking
9. **BlotterEntry** - Blotter system entries
10. **FinancialRecord** - Financial and budget records
11. **Announcement** - Announcements and events
12. **Disaster** - Disaster records
13. **DisasterBeneficiary** - Disaster relief beneficiaries
14. **InventoryItem** - Inventory items
15. **InventoryLog** - Inventory transaction logs
16. **AuditLog** - System audit trail

## Key Relationships

- **Resident** belongs to **Household** (many-to-one)
- **Resident** has many **Documents** (one-to-many)
- **Resident** can be complainant or respondent in **Incidents** (many-to-many)
- **User** creates various records (one-to-many)
- **Disaster** has many **DisasterBeneficiaries** (one-to-many)
- **InventoryItem** has many **InventoryLogs** (one-to-many)
- **Official** has many **Attendance** records (one-to-many)

## Enums

### UserRole
- ADMIN
- SECRETARY
- CPDO
- TREASURER
- SK
- STAFF

### ResidencyStatus
- NEW
- RETURNING
- TRANSFERRED

### DocumentType
- INDIGENCY
- RESIDENCY
- CLEARANCE
- SOLO_PARENT
- GOOD_MORAL

### IncidentStatus
- PENDING
- IN_PROGRESS
- RESOLVED
- CLOSED

### ProjectStatus
- PLANNING
- ONGOING
- COMPLETED
- CANCELLED

### BlotterCategory
- DOMESTIC_DISPUTE
- THEFT
- BARANGAY_DISPUTE
- YOUTH_RELATED
- PROPERTY_DISPUTE
- OTHER

### BlotterStatus
- OPEN
- IN_PROGRESS
- RESOLVED
- CLOSED

### FinancialType
- BUDGET
- EXPENSE
- ALLOCATION
- INCOME

### AnnouncementType
- GENERAL
- EVENT
- EMERGENCY
- NOTICE

### DisasterStatus
- ACTIVE
- RESOLVED
- ARCHIVED

### InventoryLogType
- ADD
- REMOVE
- RELEASE
- RETURN
- ADJUSTMENT

## Indexes

Key indexes for performance:
- Residents: householdId, firstName+lastName
- Documents: residentId, documentType
- Incidents: complainantId, status
- Projects: status
- BlotterEntries: residentId, category, status
- FinancialRecords: type, date
- Announcements: isPinned+createdAt
- Disasters: status
- AuditLogs: userId, entityType+entityId, createdAt

## Full Schema

See `backend/prisma/schema.prisma` for complete schema definition.



