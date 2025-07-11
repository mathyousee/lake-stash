# Product Requirements Document (PRD)
## Cabin Inventory Tracker Web App

---

### 1. Purpose
Develop a lightweight, mobile-friendly web application to help users easily track and manage inventory items at a cabin.

Executive Summary
The Cabin Supply Management System is a mobile-first web application designed for collaborative tracking and management of food and supplies at shared cabins or vacation properties. The system enables multiple users to monitor inventory levels, coordinate shopping trips, and maintain supply adequacy through real-time synchronization and intuitive mobile interfaces.

Product Vision
To create the most user-friendly and efficient way for cabin users to collaboratively manage supplies, eliminating the guesswork of "what do we need?" and ensuring essential items are always available for a great cabin experience.


Cabin visitors face recurring challenges:

Uncertainty about current supply levels before trips
Duplicate purchases due to poor communication
Missing essential items that ruin cabin experiences
Inefficient shopping coordination among multiple users
Lack of historical data on consumption patterns

Solution Overview

A collaborative supply management platform featuring:

Dual tracking system: Quantity-based (items/units) and percentage-based (levels)
Action-based organization: Buy, Bring, or Have Enough status per item
Real-time synchronization across all users
Mobile-optimized interface for on-the-go management
Print-friendly shopping lists for store visits
Secure access control with authentication
---


---

### 2. Target Users
Primary Users:

Cabin owners and regular visitors
Vacation rental guests with extended stays
Family groups managing shared properties
User Personas:

The Organizer - Plans trips, manages lists, coordinates supplies
The Shopper - Handles purchasing, needs clear shopping lists
The Consumer - Uses supplies, updates levels, reports needs
---


---

### 3. Goals & Objectives
- Provide a simple and intuitive interface for adding, editing, and removing inventory items
- Ensure the app is highly mobile-friendly for on-the-go use
- Keep the app lightweight for fast load times and offline accessibility

---

### 4. Features

#### Core Features
- **User Authentication**
  - Users must sign in using Azure Static Web Apps' built-in authentication (supports Microsoft, GitHub, Google, Twitter, etc.)
  - Inventory data is scoped to authenticated users for privacy and security

- **Inventory List**
  - View a list of all inventory items for the signed-in user
  - Display item name, quantity, and optional location/note
  - **Enhanced by mockup:** Show item cards with clear names, category badges (e.g., Pantry, Fresh Food), and quantity indicators (e.g., "28 items")
  - Use a slider UI to visually adjust the item quantity inline
  - Item status (e.g., Packed, Enough, Low, Buy, Bring) is visible and selectable per item
  - Notes section with inline "Add notes" prompt for each item
  - Quick delete/trash icon on each card
  - Show last updated time for each item

- **Add Item**
  - Add a new inventory item with fields:
    - Name (required)
    - Quantity (required, numeric, and unit label)
    - Category (select from pre-defined: Pantry, Fresh Food, Household, Personal Care, etc.)
    - Status (Enough, Low, Buy, Bring, etc.)
    - Notes/Description (optional)

- **Edit/Update Item**
  - Edit any field of an existing item
  - Update quantity easily using a slider

- **Remove Item**
  - Delete items from the inventory list (trash icon per card)

- **Search & Filter**
  - **Enhanced by mockup:** Global search bar for filtering items by name or type
  - Filter by category tabs (e.g., Pantry, Fresh Food, Household, Personal Care)
  - Quick status filters (e.g., All, Low, Buy, Bring, Enough)
  - Show count of items per filter

- **Mobile-First UI**
  - UI is optimized for mobile screens, with touch-friendly controls and easy navigation

#### Nice-to-Have Features (Initial Release or Future)
- Group items by category or location automatically
- Offline support (PWA)
- Export inventory as CSV or PDF

---

### 5. Non-Functional Requirements
- **Mobile-First Design:** Must be easily usable on smartphones (see ![image1](image1))
- **Performance:** Fast load and smooth interactions, even on slow connections
- **Lightweight:** Minimal dependencies and low bundle size
- **Accessible:** Follows accessibility best practices (contrast, font size, etc.)
- **Secure:** 
  - Only authenticated users can access their inventory data.
  - **All API endpoints must be protected behind authentication.** No unauthenticated access is permitted to any backend API.
  - Inventory data must be partitioned and isolated per user.

---

### 6. Technical Requirements
- **Frontend:**
  - Built with **React** (functional components, hooks, and context as appropriate)
  - Use CSS-in-JS, TailwindCSS, or lightweight CSS for styling
  - Integrates with Azure Static Web Apps authentication for login and user context
  - Deployed to **Azure Static Web Apps** for hosting and global distribution
- **Backend:**
  - Use **Azure Functions** as serverless APIs to handle CRUD operations for inventory items
  - Store inventory data in **Azure CosmosDB (NoSQL)** for scalable and flexible data storage
  - **All API endpoints must validate user identity using Azure Static Web Apps authentication context** (e.g., x-ms-client-principal header)
  - API endpoints must **reject any unauthenticated requests**
  - API must enforce user-level data isolation in CosmosDB (e.g., by using user ID as partition key)
- **Authentication/Authorization:**  
  - Utilize Azure Static Web Apps' built-in authentication for user sign-in and API access
  - Ensure inventory data is only accessible to the authenticated user (user-specific partitioning in CosmosDB)
- **Hosting:** Static frontend and API hosted as a single app using Azure Static Web Apps integration with Azure Functions

---

### 7. Success Metrics
- Users can add, edit, and delete inventory items easily on mobile devices
- App loads in under 2 seconds over 3G
- No major bugs or usability issues reported in initial tests
- Reliable cloud data storage and sync across devices
- User data is isolated and secure
- No unauthenticated access to any API endpoints

---

### 8. Out of Scope
- Complex inventory analytics or reporting
- Multi-user collaboration in MVP (beyond basic user account separation)

---

### 9. Timeline
- **Week 1:** Design and wireframes
- **Week 2:** Core frontend implementation in React
- **Week 3:** Azure Functions setup, CosmosDB integration, and authentication integration
- **Week 4:** Testing on multiple devices, bug fixes, and deployment

---

### 10. Future Considerations
- Shared or family/group inventory support (multi-user collaboration)
- Notifications/reminders for low-stock items
- Enhanced offline/PWA functionality

---
