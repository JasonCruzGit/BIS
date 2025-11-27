# Barangay Information System (BIS)
## Complete User Guide - Step by Step

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Account Types & Roles](#account-types--roles)
3. [Getting Started](#getting-started)
4. [Admin Portal - Step by Step](#admin-portal---step-by-step)
5. [Resident Portal - Step by Step](#resident-portal---step-by-step)
6. [Common Workflows](#common-workflows)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

The Barangay Information System (BIS) has **two main portals**:

1. **Admin Portal** - For barangay staff and officials
2. **Resident Portal** - For barangay residents

Both portals serve different purposes and have different access levels.

---

## 👥 Account Types & Roles

### **Admin Portal Accounts**

The admin portal has **6 different user roles**, each with specific permissions:

#### 1. **ADMIN** (Administrator)
- **Full system access**
- Can manage all modules
- Can create/edit/delete users
- Can view audit logs
- Can access all financial records
- **Use Case**: System administrator, IT manager

#### 2. **SECRETARY**
- Can manage residents and households
- Can issue documents
- Can manage announcements
- Can view most modules
- **Use Case**: Barangay secretary, office staff

#### 3. **CPDO** (City Planning and Development Officer)
- Can manage projects and programs
- Can track incidents
- Can manage inventory
- **Use Case**: Planning officer, project coordinator

#### 4. **TREASURER**
- Can manage financial records
- Can view budgets and expenses
- Can track payments
- **Use Case**: Barangay treasurer, finance officer

#### 5. **SK** (Sangguniang Kabataan)
- Can manage youth-related programs
- Can view announcements
- Limited access to other modules
- **Use Case**: SK chairman, youth coordinator

#### 6. **STAFF**
- Basic access to assigned modules
- Can view and create records
- Limited editing permissions
- **Use Case**: General staff, office assistants

### **Resident Portal Accounts**

- **All residents** can access the portal
- No separate account creation needed
- Login using contact number + password (or date of birth for first-time login)
- Can request documents, file complaints, view announcements

---

## 🚀 Getting Started

### **For Admin Portal Users**

#### **Step 1: Access the Login Page**
1. Open your web browser
2. Navigate to: `https://your-domain.com/login` (or `http://localhost:3000/login` for local)
3. You'll see the admin login page

#### **Step 2: Login Credentials**
- **Email**: Your assigned email address (e.g., `admin@barangay.gov.ph`)
- **Password**: Your assigned password (contact admin if you forgot)

#### **Step 3: First Login**
1. Enter your email and password
2. Click "Sign in"
3. You'll be redirected to the Dashboard

#### **Step 4: Default Admin Account**
- **Email**: `admin@barangay.gov.ph`
- **Password**: `admin123` (change after first login)
- This account has full ADMIN privileges

### **For Residents**

#### **Step 1: Access Resident Portal**
1. Open your web browser
2. Navigate to: `https://your-domain.com/portal/login` (or `http://localhost:3000/portal/login`)
3. You'll see the resident portal login page

#### **Step 2: First-Time Login (New Resident)**
1. Enter your **Contact Number** (registered with barangay)
2. Enter your **Date of Birth** (format: YYYY-MM-DD)
3. Click "Login"
4. **Password Setup Modal** will appear
5. Enter your desired password (minimum 6 characters)
6. Confirm password
7. Click "Set Password"
8. You'll be redirected to your dashboard

#### **Step 3: Returning Login (Existing Resident)**
1. Enter your **Contact Number**
2. Enter your **Password**
3. Click "Login"
4. You'll be redirected to your dashboard

---

## 🏢 Admin Portal - Step by Step

### **Dashboard Overview**

After logging in, you'll see the **Dashboard** with:
- **Statistics Cards**: Total residents, documents, projects, etc.
- **Quick Actions**: Add Resident, Issue Document buttons
- **Recent Activity**: Latest system activities
- **Announcements**: Recent announcements
- **Charts**: Visual data representation

### **Module 1: Managing Residents**

#### **Adding a New Resident**

1. **Navigate to Residents**
   - Click "Residents" in the sidebar menu
   - Or click "Add Resident" from dashboard

2. **Click "Add Resident" Button**
   - Located at top right of the page

3. **Fill in the Form**
   - **Personal Information**:
     - First Name *
     - Last Name *
     - Middle Name (optional)
     - Date of Birth *
     - Gender *
     - Civil Status *
   - **Contact Information**:
     - Contact Number *
     - Email (optional)
     - Address *
   - **Additional Information**:
     - Photo (optional - upload image)
     - Employment Status
     - Educational Background
   - **Household**:
     - Select existing household OR
     - Create new household

4. **Save the Resident**
   - Click "Create Resident" button
   - You'll see a success message
   - Resident will appear in the residents list

#### **Searching for a Resident**

1. Go to **Residents** page
2. Use the **Search bar** at the top
3. Type resident's name, contact number, or address
4. Results appear instantly as you type

#### **Editing a Resident**

1. Go to **Residents** page
2. Find the resident (use search if needed)
3. Click the **"Edit"** button (pencil icon)
4. Modify the information
5. Click "Update Resident"

#### **Viewing Resident Details**

1. Go to **Residents** page
2. Click the **"View"** button (eye icon)
3. See complete resident profile
4. View related documents, requests, etc.

---

### **Module 2: Document Issuance**

#### **Issuing a Document (Certificate)**

1. **Navigate to Documents**
   - Click "Documents" in sidebar
   - Or click "Issue Document" from dashboard

2. **Click "Issue Document" Button**

3. **Select Resident**
   - Use search to find resident
   - Click on resident to select

4. **Select Document Type**
   - Certificate of Indigency
   - Certificate of Residency
   - Barangay Clearance
   - Solo Parent Certificate
   - Certificate of Good Moral Character

5. **Fill in Details**
   - Purpose (optional)
   - Additional notes (optional)

6. **Generate Document**
   - Click "Issue Document"
   - System generates PDF automatically
   - Document appears in documents list

7. **Download Document**
   - Click "Download" button
   - PDF opens in new tab
   - Save or print as needed

#### **Processing Resident Document Requests**

1. **Navigate to Resident Requests**
   - Click "Resident Requests" in sidebar

2. **View Pending Requests**
   - See list of document requests from residents
   - Each request shows:
     - Resident name
     - Document type
     - Request date
     - Status

3. **Review Request**
   - Click on a request to view details
   - See resident information and purpose

4. **Approve or Reject**
   - **To Approve**:
     - Click "Approve"
     - Set fee (if applicable)
     - Add notes (optional)
     - Click "Update Request"
     - System automatically generates PDF
   - **To Reject**:
     - Click "Reject"
     - Enter rejection reason
     - Click "Update Request"

5. **Complete Request**
   - Once approved, status changes to "Processing"
   - When PDF is ready, status becomes "Completed"
   - Resident can download from their portal

---

### **Module 3: Managing Households**

#### **Creating a Household**

1. **Navigate to Households**
   - Click "Households" in sidebar

2. **Click "Add Household"**

3. **Fill in Household Information**
   - Household Head (select from residents)
   - Address *
   - Zone/Area
   - Contact Information

4. **Add Household Members**
   - Search and select residents
   - Add multiple members

5. **Save Household**
   - Click "Create Household"

#### **Adding Members to Existing Household**

1. Go to **Households** page
2. Find the household
3. Click "Edit"
4. In "Household Members" section, click "Add Member"
5. Search and select resident
6. Click "Update Household"

---

### **Module 4: Incident Reporting**

#### **Reporting an Incident**

1. **Navigate to Incidents**
   - Click "Incidents" in sidebar

2. **Click "Report Incident"**

3. **Select Complainant**
   - Search for resident
   - Select complainant

4. **Select Respondent** (if applicable)
   - Search for resident
   - Or leave blank if no respondent

5. **Fill in Incident Details**
   - Incident Date *
   - Narrative/Description *
   - Actions Taken (optional)
   - Status (default: PENDING)
   - Hearing Date (optional)

6. **Add Attachments** (optional)
   - Click "Choose Files"
   - Select photos or documents
   - Maximum 5MB per file

7. **Save Incident**
   - Click "Report Incident"
   - Incident appears in incidents list

#### **Updating Incident Status**

1. Go to **Incidents** page
2. Find the incident
3. Click "Edit"
4. Change status:
   - PENDING → IN_PROGRESS → RESOLVED → CLOSED
5. Update actions taken
6. Click "Update Incident"

---

### **Module 5: Project Management**

#### **Creating a Project**

1. **Navigate to Projects**
   - Click "Projects" in sidebar

2. **Click "New Project"**

3. **Fill in Project Information**
   - Title *
   - Description *
   - Budget *
   - Contractor (optional)
   - Start Date *
   - End Date (optional)
   - Status (default: PLANNING)

4. **Add Documents** (optional)
   - Upload project documents
   - PDF, images, etc.

5. **Add Progress Photos** (optional)
   - Upload photos showing progress

6. **Save Project**
   - Click "Create Project"

#### **Updating Project Status**

1. Go to **Projects** page
2. Find the project
3. Click "Edit"
4. Update status:
   - PLANNING → ONGOING → COMPLETED
5. Add progress photos
6. Update budget if needed
7. Click "Update Project"

---

### **Module 6: Announcements**

#### **Creating an Announcement**

1. **Navigate to Announcements**
   - Click "Announcements" in sidebar

2. **Click "New Announcement"**

3. **Fill in Announcement Details**
   - Title *
   - Content/Description *
   - Type:
     - GENERAL
     - EVENT
     - URGENT
     - NOTICE
   - Start Date (optional)
   - End Date (optional)
   - Pin Announcement (optional)

4. **Add Attachments** (optional)
   - Upload files or images
   - Maximum 5MB per file

5. **Publish Announcement**
   - Click "Create Announcement"
   - Announcement appears in:
     - Admin announcements page
     - Resident portal announcements

#### **Editing/Deleting Announcements**

1. Go to **Announcements** page
2. Find the announcement
3. Click "Edit" to modify
4. Or click "Delete" to remove
5. Confirm deletion

---

### **Module 7: Blotter System**

#### **Creating a Blotter Entry**

1. **Navigate to Blotter**
   - Click "Blotter" in sidebar

2. **Click "New Entry"**

3. **Select Resident**
   - Search and select resident involved

4. **Fill in Blotter Details**
   - Category:
     - Domestic Dispute
     - Theft
     - Barangay Dispute
     - Youth Related
     - Property Dispute
     - Other
   - Incident Date *
   - Narrative/Description *
   - Status (default: OPEN)
   - Actions Taken (optional)

5. **Save Entry**
   - Click "Create Entry"

#### **Updating Blotter Status**

1. Go to **Blotter** page
2. Find the entry
3. Click "Edit"
4. Update status: OPEN → IN_PROGRESS → RESOLVED → CLOSED
5. Add resolution notes
6. Click "Update Entry"

---

### **Module 8: Inventory Management**

#### **Adding Inventory Item**

1. **Navigate to Inventory**
   - Click "Inventory" in sidebar

2. **Click "Add Item"**

3. **Fill in Item Details**
   - Item Name *
   - Category
   - Description
   - Quantity *
   - Unit of Measure
   - Location
   - Minimum Stock Level

4. **Save Item**
   - Click "Add Item"
   - System generates QR code automatically

#### **Updating Inventory**

1. Go to **Inventory** page
2. Find the item
3. Click "Edit"
4. Update quantity, location, etc.
5. Click "Update Item"

#### **Inventory Transactions**

- **Add**: Increase stock
- **Remove**: Decrease stock
- **Release**: Issue to department/person
- **Return**: Return from department/person
- **Adjustment**: Correct inventory count

---

### **Module 9: Financial Management**

#### **Creating Financial Record**

1. **Navigate to Financial**
   - Click "Financial" in sidebar (if available)

2. **Click "Create Record"**

3. **Select Record Type**
   - BUDGET
   - EXPENSE
   - INCOME
   - ALLOCATION

4. **Fill in Details**
   - Category
   - Description *
   - Amount *
   - Date *
   - Receipt (optional - upload image/PDF)

5. **Save Record**
   - Click "Create Record"

---

### **Module 10: User Management (Admin Only)**

#### **Creating a New User Account**

1. **Navigate to User Accounts**
   - Click "User Accounts" in sidebar
   - Only ADMIN and BARANGAY_CHAIRMAN can access

2. **Click "Add User"**

3. **Fill in User Information**
   - Email * (must be unique)
   - Password * (minimum 6 characters)
   - First Name *
   - Last Name *
   - Role *:
     - ADMIN
     - SECRETARY
     - CPDO
     - TREASURER
     - SK
     - STAFF
   - Active Status (default: Active)

4. **Create User**
   - Click "Add User"
   - User receives email with login credentials

#### **Editing User Account**

1. Go to **User Accounts** page
2. Find the user
3. Click "Edit"
4. Modify information
5. Can change role, active status, etc.
6. Click "Update User"

#### **Resetting User Password**

1. Go to **User Accounts** page
2. Find the user
3. Click "Edit"
4. Enter new password
5. Click "Update User"

---

## 👤 Resident Portal - Step by Step

### **Dashboard Overview**

After logging in, residents see:
- **My Requests**: Document requests status
- **Announcements**: Recent barangay announcements
- **Quick Actions**: Request Document, File Complaint

---

### **Requesting a Document**

#### **Step 1: Navigate to Requests**
1. Click "Requests" in the menu
2. Or click "Request Document" from dashboard

#### **Step 2: Create New Request**
1. Click "New Request" button

#### **Step 3: Select Document Type**
- Certificate of Indigency
- Certificate of Residency
- Barangay Clearance
- Solo Parent Certificate
- Certificate of Good Moral Character

#### **Step 4: Fill in Purpose**
- Enter purpose for the document (optional but recommended)
- Example: "For employment application"

#### **Step 5: Submit Request**
1. Click "Submit Request"
2. You'll see a success message
3. Request appears in "My Requests" with status "PENDING"

#### **Step 6: Track Request Status**
- **PENDING**: Waiting for approval
- **APPROVED**: Approved, processing
- **PROCESSING**: Document being prepared
- **COMPLETED**: Ready for download
- **REJECTED**: Request was rejected (see reason)

#### **Step 7: Download Document**
1. When status is "COMPLETED"
2. Click "Download" button
3. PDF opens in new tab
4. Save or print the document

---

### **Filing a Complaint**

#### **Step 1: Navigate to Complaints**
1. Click "Complaints" in the menu
2. Or click "File Complaint" from dashboard

#### **Step 2: Create New Complaint**
1. Click "New Complaint" button

#### **Step 3: Fill in Complaint Details**
- Incident Date *
- Narrative/Description *
- Upload attachments (optional)

#### **Step 4: Submit Complaint**
1. Click "Submit Complaint"
2. Complaint is sent to barangay
3. You can track status in "My Complaints"

---

### **Viewing Announcements**

1. **Navigate to Announcements**
   - Click "Announcements" in menu
   - Or view from dashboard

2. **View Announcement Details**
   - Click on announcement to read full content
   - View attachments if any
   - See start/end dates

3. **Filter Announcements**
   - Filter by type (General, Event, Urgent, Notice)
   - Search by keyword

---

## 🔄 Common Workflows

### **Workflow 1: Complete Document Request Process**

#### **From Resident Side:**
1. Resident logs into portal
2. Creates document request
3. Status: PENDING
4. Waits for approval

#### **From Admin Side:**
1. Admin logs into admin portal
2. Goes to "Resident Requests"
3. Sees pending request
4. Reviews request details
5. **Option A - Approve:**
   - Clicks "Approve"
   - Sets fee (if applicable)
   - Clicks "Update Request"
   - System generates PDF automatically
   - Status: COMPLETED
6. **Option B - Reject:**
   - Clicks "Reject"
   - Enters rejection reason
   - Clicks "Update Request"
   - Status: REJECTED

#### **Back to Resident:**
1. Resident checks request status
2. If COMPLETED: Downloads PDF
3. If REJECTED: Views rejection reason

---

### **Workflow 2: Adding New Resident and Issuing Document**

1. **Add Resident** (Admin)
   - Go to Residents → Add Resident
   - Fill in all information
   - Save

2. **Issue Document** (Admin)
   - Go to Documents → Issue Document
   - Search and select the resident
   - Select document type
   - Generate document
   - Download and provide to resident

---

### **Workflow 3: Managing Household**

1. **Create Household** (Admin)
   - Go to Households → Add Household
   - Select household head
   - Enter address
   - Save

2. **Add Members** (Admin)
   - Edit household
   - Add household members
   - Update

3. **View Household** (Admin)
   - See all members
   - View household statistics

---

## 🔐 Security & Best Practices

### **Password Guidelines**
- Minimum 6 characters
- Use combination of letters and numbers
- Don't share your password
- Change password regularly

### **For Admin Users:**
- Log out when finished
- Don't share your account
- Review audit logs regularly
- Keep user accounts updated

### **For Residents:**
- Keep your contact number updated
- Remember your password
- Contact barangay if you forget password
- Check announcements regularly

---

## ❓ Troubleshooting

### **Can't Login to Admin Portal**

**Problem**: "Invalid credentials"
- **Solution**: 
  - Check email and password
  - Contact admin to reset password
  - Ensure account is active

**Problem**: "Account is inactive"
- **Solution**: Contact admin to activate account

### **Can't Login to Resident Portal**

**Problem**: "Resident not found"
- **Solution**: 
  - Verify contact number is correct
  - Contact barangay to verify registration
  - Ensure you're registered in the system

**Problem**: "Password incorrect"
- **Solution**: 
  - Try using date of birth for first-time login
  - Contact barangay to reset password

### **Document Request Not Showing**

**Problem**: Request status stuck on "PENDING"
- **Solution**: 
  - Wait for admin to process
  - Contact barangay office
  - Check if request was rejected

### **Can't Download Document**

**Problem**: Download button not working
- **Solution**: 
  - Ensure status is "COMPLETED"
  - Check browser popup blocker
  - Try different browser
  - Contact barangay if issue persists

### **Form Not Submitting**

**Problem**: Button is disabled/unclickable
- **Solution**: 
  - Check all required fields (marked with *)
  - Ensure all fields are filled correctly
  - Check internet connection
  - Refresh page and try again

---

## 📞 Getting Help

### **For Admin Users:**
- Contact system administrator
- Check audit logs for activity history
- Review user manual
- Contact technical support

### **For Residents:**
- Visit barangay office
- Call barangay hotline
- Check announcements for updates
- Use resident portal help section

---

## 📝 Quick Reference

### **Admin Portal URLs:**
- Login: `/login`
- Dashboard: `/dashboard`
- Residents: `/residents`
- Documents: `/documents`
- Projects: `/projects`
- Announcements: `/announcements`

### **Resident Portal URLs:**
- Login: `/portal/login`
- Dashboard: `/portal/dashboard`
- Requests: `/portal/requests`
- Complaints: `/portal/complaints`
- Announcements: `/portal/announcements`

### **Keyboard Shortcuts:**
- `Ctrl + K` or `Cmd + K`: Quick search (if implemented)
- `Esc`: Close modals
- `Enter`: Submit forms

---

## 🎓 Training Resources

1. **Video Tutorials**: Available in help section
2. **User Manual**: This document
3. **FAQ Section**: Common questions answered
4. **Live Training**: Contact admin to schedule

---

*Last Updated: [Date]*
*Version: 1.0*

**For questions or support, contact your system administrator.**

