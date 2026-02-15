import { type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SavedProvider } from './context/SavedContext';

// Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import SavedDoctors from './pages/SavedDoctors';
import MyReviews from './pages/MyReviews'; // Import the new page
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <SavedProvider>
        <Routes>
          {/* Auth Routes (No Navbar usually, or you can wrap them if you want) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Main Layout Routes (Persistent Navbar) */}
          <Route element={<Layout />}>
             <Route path="/" element={<Home />} />
             <Route path="/doctors" element={<Doctors />} />
             <Route path="/my-reviews" element={
               <ProtectedRoute><MyReviews /></ProtectedRoute>
             } />
             
             {/* Protected Pages */}
             <Route path="/saved" element={
               <ProtectedRoute>
                 <SavedDoctors />
               </ProtectedRoute>
             } />
            
          </Route>
        </Routes>
      </SavedProvider>
    </AuthProvider>
  );
}

export default App;