# Smart Appointment Management System - Frontend

A modern, responsive web application for managing appointments between customers and businesses.

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand + React Query
- **HTTP Client**: Axios with interceptors
- **UI Library**: Tailwind CSS + Custom Components
- **Form Handling**: React Hook Form + Zod validation
- **Date/Time**: date-fns
- **Notifications**: react-hot-toast
- **Icons**: Lucide React
- **Charts**: Recharts

## Features

### Authentication
- User registration with email verification
- Login with JWT token authentication
- Password reset functionality
- Role-based access control (Customer, Business Owner)

### Customer Features
- Browse and search businesses
- Book appointments with service and employee selection
- View appointment history
- Manage favorites
- Rate and review services
- Real-time notifications

### Business Owner Features
- Dashboard with analytics and charts
- Manage services and employees
- View and manage appointments
- Track revenue and statistics
- Set working hours
- View customer reviews

### Public Pages
- Home page with hero section
- Browse businesses with filters
- Business details page

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running on `http://localhost:8080`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components (Button, Input, Card, etc.)
│   ├── Layout.tsx   # Main layout component
│   ├── ProtectedRoute.tsx
│   ├── NotificationBell.tsx
│   └── BookingModal.tsx
├── pages/           # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── CustomerDashboard.tsx
│   ├── BusinessDashboard.tsx
│   └── ...
├── services/        # API service functions
│   ├── authService.ts
│   ├── appointmentService.ts
│   ├── businessService.ts
│   └── notificationService.ts
├── store/           # Zustand stores
│   └── authStore.ts
├── hooks/           # Custom React hooks
│   └── useAuth.ts
├── lib/             # Utility functions
│   ├── api.ts       # Axios instance with interceptors
│   └── utils.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── App.tsx          # Main app component with routes
└── main.tsx         # Entry point
```

## API Integration

The application expects the backend API to be running on `http://localhost:8080/api`. All API endpoints should return responses in the following format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ },
  "timestamp": "2025-12-25T05:00:00"
}
```

### Authentication

JWT tokens are stored in `localStorage` and automatically included in API requests via Axios interceptors.

## Environment Variables

You can create a `.env` file to customize the API base URL:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## License

MIT


