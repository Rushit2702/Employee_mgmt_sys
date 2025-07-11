# Employeement management System

## Overview
This EMS (Employee Management System) now uses a session-based authentication system that provides enhanced security and automatic logout functionality.

## Features

### 1. Session Management
- **Session Duration**: 8 hours by default
- **Automatic Cleanup**: Expired sessions are automatically removed from the database
- **Session Validation**: Each request validates the session before allowing access

### 2. Automatic Logout
- **Tab Close Detection**: User is automatically logged out when the browser tab is closed
- **Visibility Change**: Logout occurs when the tab becomes hidden (switching tabs, minimizing)
- **Before Unload**: Logout happens when the user navigates away from the page

### 3. Security Features
- **Session ID**: Unique session identifier stored in both database and client
- **HTTP-Only Cookies**: Session cookies are protected from XSS attacks
- **Secure Cookies**: In production, cookies are only sent over HTTPS
- **Session Invalidation**: Sessions can be manually invalidated on logout

## Backend Implementation

### Session Model (`backend/models/Session.js`)
```javascript
{
  userId: ObjectId,        // Reference to User
  sessionId: String,       // Unique session identifier
  expiresAt: Date,         // Session expiration time
  userAgent: String,       // Browser user agent
  ipAddress: String,       // Client IP address
  isActive: Boolean        // Session status
}
```

### Authentication Flow
1. **Login**: Creates new session, returns JWT token with session ID
2. **Request**: Validates JWT token and checks session in database
3. **Logout**: Invalidates session and clears cookies

### API Endpoints
- `POST /api/auth/login` - Create new session
- `POST /api/auth/logout` - Invalidate session
- `POST /api/auth/validate-session` - Validate existing session

## Frontend Implementation

### AuthContext (`frontend/src/context/AuthContext.js`)
- Manages user authentication state
- Handles session validation on app load
- Provides login/logout functions
- Implements tab close detection

### Session Storage
- **Token**: JWT token stored in localStorage
- **Session ID**: Session identifier stored in localStorage
- **Cookies**: Session cookies for additional security

### Automatic Logout Events
- `visibilitychange` - Detects when tab becomes hidden
- `beforeunload` - Detects when user navigates away

### Modal Add Forms for Employees, Payroll, and Attendance
- **Modern Add Experience**: Adding new Employees, Payroll, or Attendance records is now done through a modal form.
- **How it works**:
  - Click the "+ Add" button on any of these pages to open a modal form with a shadow overlay.
  - The form includes all required fields, a **Submit** button, and a **Reset** button.
  - On submit, an animation (spinner, then checkmark) is shown for feedback.
  - The modal closes automatically after successful submission.
- **Consistent UI**: The same modal experience is used across all three pages for a clean and user-friendly interface.

## Usage

### Starting the Application
1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

### Session Behavior
- User logs in → Session created for 8 hours
- User closes tab → Automatic logout
- User switches tabs → Automatic logout
- Session expires → User redirected to login
- User clicks logout → Manual logout

## Configuration

### Environment Variables
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS (optional)
- `NODE_ENV` - Environment (development/production)

### Session Duration
To change session duration, modify:
- `backend/controllers/authController.js` - `expiresAt` calculation
- `backend/controllers/authController.js` - JWT token expiration
- `backend/controllers/authController.js` - Cookie maxAge

## Security Considerations

1. **Session Hijacking**: Sessions are tied to specific session IDs
2. **XSS Protection**: HTTP-only cookies prevent JavaScript access
3. **CSRF Protection**: SameSite cookie attribute
4. **Session Fixation**: New session ID generated on each login
5. **Brute Force**: Rate limiting should be implemented separately

## Troubleshooting

### Common Issues
1. **Session not persisting**: Check CORS configuration
2. **Automatic logout not working**: Verify event listeners are attached
3. **Database connection errors**: Ensure MongoDB is running
4. **Cookie issues**: Check domain and path settings

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment variables. 