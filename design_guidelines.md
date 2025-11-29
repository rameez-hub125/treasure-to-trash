# Design Guidelines: Admin Portal for Zero-to-Hero Waste Management

## Design Approach
**Reference-Based**: Match the existing application's green-themed, eco-friendly aesthetic while adding admin-specific dashboard layouts. Draw inspiration from Linear's clean data tables and Notion's sidebar navigation patterns.

## Core Design Elements

### A. Typography
- **Font Family**: Poppins (weights: 300 light, 400 regular, 600 semibold)
- **Hierarchy**:
  - Page titles: `text-4xl font-bold text-gray-800`
  - Section headers: `text-2xl font-semibold text-gray-800`
  - Card titles: `text-xl font-semibold text-gray-800`
  - Body text: `text-base text-gray-600`
  - Data labels: `text-sm text-gray-600`
  - Metrics/stats: `text-3xl font-bold text-gray-800`

### B. Layout System
- **Spacing Primitives**: Use Tailwind units of 4, 6, 8, 10, 12, 16, 20
- **Admin Layout**: Sidebar (w-64) + Main content (flex-1) with `gap-6`
- **Container**: `max-w-7xl mx-auto px-6`
- **Card padding**: `p-6` for compact cards, `p-8` or `p-10` for feature cards
- **Section spacing**: `mb-12` between major sections, `mb-6` between related elements

### C. Color System
- **Primary Green**: `bg-green-600` buttons, `text-green-600` accents, `bg-green-100` light backgrounds
- **Backgrounds**: White (`bg-white`) for cards, `bg-gray-50` for page background, `bg-gray-100` for sidebar
- **Text**: `text-gray-800` headings, `text-gray-600` body, `text-gray-500` muted
- **Borders**: `border-gray-200` for subtle dividers, `border-green-200` for selected states
- **Status Colors**:
  - Pending: `bg-yellow-100 text-yellow-800`
  - Approved/Collected: `bg-green-100 text-green-800`
  - Rejected: `bg-red-100 text-red-800`

### D. Component Library

**Admin Button (Homepage)**
- Style: `bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-full font-medium`
- Position: Top-right header area
- Icon: Settings or Shield from lucide-react

**Sidebar Navigation**
- Background: `bg-gray-100 border-r border-gray-200`
- Active item: `bg-green-100 text-green-700 border-l-4 border-green-600`
- Inactive: `text-gray-600 hover:bg-gray-50`
- Padding: `px-4 py-3` per item, `gap-2` between items

**Dashboard Stats Cards**
- Style: `bg-white p-6 rounded-xl shadow-md hover:shadow-lg border border-gray-100`
- Icon area: `bg-green-100 p-4 rounded-full mb-4` with `text-green-600` icon
- Layout: Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`

**Data Tables**
- Container: `bg-white rounded-xl shadow-md overflow-hidden`
- Header: `bg-gray-50 border-b border-gray-200 px-6 py-4`
- Rows: `px-6 py-4 border-b border-gray-100 hover:bg-gray-50`
- Actions: Small green-600 buttons with lucide-react icons

**Forms & Inputs**
- Text inputs: `border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500`
- Buttons: Primary `bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-3`
- Secondary: `bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full px-6 py-3`

**Modals/Dialogs**
- Overlay: `bg-black/50`
- Content: `bg-white rounded-2xl p-8 shadow-xl max-w-2xl`
- Close button: Top-right with X icon

### E. Admin Portal Sections

**Dashboard**
- 4-column stats grid showing: Total Users, Pending Reports, Total Waste Collected, Tokens Distributed
- Recent activity feed with icons
- Quick action buttons

**Users Management**
- Search bar: `rounded-full border-gray-300 mb-6`
- Table columns: ID, Name, Email, Tokens, Level, Created Date, Actions
- Row actions: View Details, Adjust Tokens (icons only)

**Reports Management**
- Filter tabs: All, Pending, Approved, Collected (pill-style with green-600 for active)
- Table: ID, Location, Type, Amount, Status, Submitted By, Date, Actions
- Actions: Approve, Reject, Assign Collector buttons with corresponding icons

**Rewards Management**
- Card grid layout for existing rewards (2-3 columns)
- Create new reward button (large, prominent, green-600)
- Each card shows: Name, Points Required, Status toggle, Edit/Delete icons

**Transactions Log**
- Timeline-style list with alternating left/right entries
- Type badges (Earned/Redeemed) with color coding
- Filters by date range and user

**Notifications**
- Compose area: `bg-gray-50 p-6 rounded-xl mb-6`
- Sent notifications list below with read/unread indicators

### F. Responsive Behavior
- Sidebar collapses to hamburger menu on mobile (`md:block hidden`)
- Stats grid: 1 column mobile, 2 tablet, 4 desktop
- Tables: Horizontal scroll on mobile with sticky first column
- Forms: Single column on mobile, maintain spacing

### G. Icons
**Library**: Lucide-react (already in project)
**Admin Icons**: Shield (admin access), Users (users section), FileText (reports), Gift (rewards), ArrowLeftRight (transactions), Bell (notifications), LayoutDashboard (dashboard), Settings, LogOut

## Images
No images required for admin portal - focus on clean data visualization and dashboard layouts. The existing homepage retains its animated globe icon component.