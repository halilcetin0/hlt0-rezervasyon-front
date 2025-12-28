# Quick Start Guide

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## Backend Setup

Make sure your backend API is running on `http://localhost:8080` before using the application.

You can customize the API URL by creating a `.env` file:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Testing the Application

### 1. Register a New Account

- Navigate to `/register`
- Fill in the registration form
- Choose either "Customer" or "Business Owner" role
- Check your email for verification link

### 2. Verify Email

- Click the verification link from your email
- Or navigate to `/verify-email?token=YOUR_TOKEN`

### 3. Login

- Navigate to `/login`
- Enter your email and password
- You'll be redirected to your dashboard based on your role

### 4. Customer Features

- Browse businesses at `/businesses`
- View business details and book appointments
- Manage appointments in `/dashboard`

### 5. Business Owner Features

- Access dashboard at `/business/dashboard`
- View analytics and statistics
- Manage services and employees (UI ready, backend integration needed)

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # Base UI components
│   ├── Layout.tsx      # Main layout
│   ├── ProtectedRoute.tsx
│   ├── NotificationBell.tsx
│   └── BookingModal.tsx
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── CustomerDashboard.tsx
│   └── BusinessDashboard.tsx
├── services/           # API services
├── store/              # State management
├── hooks/              # Custom hooks
├── lib/                # Utilities
└── types/              # TypeScript types
```

## Key Features Implemented

✅ Authentication (Register, Login, Email Verification, Password Reset)
✅ Protected Routes with Role-based Access
✅ Customer Dashboard with Appointments
✅ Business Owner Dashboard with Analytics
✅ Browse Businesses with Search/Filter
✅ Business Details Page
✅ Appointment Booking Flow
✅ Notification System (Polling every 30s)
✅ Responsive Design
✅ Error Handling with Toast Notifications

## Next Steps

1. Connect to your backend API
2. Implement additional features:
   - Service Management (CRUD)
   - Employee Management (CRUD)
   - Work Schedule Management
   - Review System
   - Favorites System
3. Add optional enhancements:
   - Dark mode
   - Calendar view
   - Google Maps integration
   - WebSocket for real-time notifications


