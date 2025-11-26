# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN"
  }
}
```

#### POST /auth/register
Register new user (Admin only)

#### GET /auth/me
Get current user information

#### PUT /auth/change-password
Change user password

---

### Residents

#### GET /residents
Get all residents with pagination

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `archived` (default: false)

#### GET /residents/search
Search residents

**Query Parameters:**
- `q` - Search query (name or address)
- `householdNumber` - Filter by household number

#### GET /residents/:id
Get resident by ID

#### POST /residents
Create new resident

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "sex": "MALE",
  "civilStatus": "SINGLE",
  "address": "123 Main St",
  "contactNo": "09123456789",
  "occupation": "Engineer",
  "education": "College",
  "householdId": "uuid",
  "residencyStatus": "NEW"
}
```

#### PUT /residents/:id
Update resident

#### PATCH /residents/:id/archive
Archive resident

---

### Households

#### GET /households
Get all households

#### GET /households/:id
Get household by ID

#### POST /households
Create household

#### PUT /households/:id
Update household

#### DELETE /households/:id
Delete household

---

### Documents

#### GET /documents
Get all documents

#### GET /documents/types
Get available document types

#### GET /documents/:id
Get document by ID

#### GET /documents/:id/pdf
Generate and download PDF

#### POST /documents
Create document

**Request Body:**
```json
{
  "documentType": "INDIGENCY",
  "residentId": "uuid",
  "purpose": "For scholarship application",
  "template": "Custom template text"
}
```

---

### Incidents

#### GET /incidents
Get all incidents

#### GET /incidents/:id
Get incident by ID

#### POST /incidents
Create incident

#### PUT /incidents/:id
Update incident

#### PATCH /incidents/:id/status
Update incident status

---

### Projects

#### GET /projects
Get all projects

#### GET /projects/:id
Get project by ID

#### POST /projects
Create project

#### PUT /projects/:id
Update project

#### PATCH /projects/:id/status
Update project status

---

### Officials

#### GET /officials
Get all officials

#### GET /officials/:id
Get official by ID

#### GET /officials/:id/attendance
Get official attendance

#### POST /officials
Create official

#### POST /officials/:id/attendance
Record attendance

#### PUT /officials/:id
Update official

#### DELETE /officials/:id
Delete official

---

### Blotter

#### GET /blotter
Get all blotter entries

#### GET /blotter/export
Export blotter report (XLSX)

#### GET /blotter/:id
Get blotter entry by ID

#### POST /blotter
Create blotter entry

#### PUT /blotter/:id
Update blotter entry

#### PATCH /blotter/:id/status
Update blotter status

---

### Financial

#### GET /financial
Get financial records

#### GET /financial/summary
Get financial summary

#### GET /financial/export
Export financial report (XLSX)

#### GET /financial/:id
Get financial record by ID

#### POST /financial
Create financial record

#### PUT /financial/:id
Update financial record

#### DELETE /financial/:id
Delete financial record

---

### Announcements

#### GET /announcements/active
Get active announcements (public)

#### GET /announcements
Get all announcements

#### GET /announcements/:id
Get announcement by ID

#### POST /announcements
Create announcement

#### PUT /announcements/:id
Update announcement

#### DELETE /announcements/:id
Delete announcement

---

### Disasters

#### GET /disasters
Get all disasters

#### GET /disasters/:id
Get disaster by ID

#### GET /disasters/:id/beneficiaries
Get disaster beneficiaries

#### GET /disasters/:id/beneficiaries/export
Export beneficiary list (XLSX)

#### POST /disasters
Create disaster

#### POST /disasters/:id/beneficiaries
Add beneficiary

#### PUT /disasters/:id
Update disaster

#### PATCH /disasters/:id/status
Update disaster status

---

### Inventory

#### GET /inventory
Get all inventory items

#### GET /inventory/:id
Get inventory item by ID

#### GET /inventory/:id/logs
Get inventory logs

#### GET /inventory/:id/qrcode
Get QR code for item

#### POST /inventory
Create inventory item

#### POST /inventory/:id/logs
Add inventory log

#### PUT /inventory/:id
Update inventory item

#### DELETE /inventory/:id
Delete inventory item

---

### Audit Logs

#### GET /audit
Get audit logs (Admin/Secretary only)

#### GET /audit/:id
Get audit log by ID

#### GET /audit/entity/:entityType/:entityId
Get audit logs for specific entity

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

**Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error



