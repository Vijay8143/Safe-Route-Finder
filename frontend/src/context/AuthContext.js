import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Create auth context
const AuthContext = createContext();

// Mock user data for demo
const DEMO_USER = {
  id: 1,
  email: 'demo@saferoute.com',
  name: 'Demo User',
  phone: '+1-555-0123',
  emergency_contact: '+1-555-0124',
  avatar: '👤',
  preferences: {
    notifications: true,
    darkMode: true,
    locationSharing: true,
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing auth token
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          // Simulate token validation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          toast.success('Welcome back!');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo login validation
      if (email === 'demo@saferoute.com' && password === 'Demo123!') {
        const token = 'demo_auth_token_' + Date.now();
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(DEMO_USER));
        
        setUser(DEMO_USER);
        setIsAuthenticated(true);
        
        toast.success('Login successful! Welcome to SafeRoute Navigator.');
        return { success: true };
      } else {
        toast.error('Invalid credentials. Use demo@saferoute.com / Demo123!');
        return { 
          success: false, 
          error: 'Invalid email or password' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { 
        success: false, 
        error: 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new user (in real app, this would be an API call)
      const newUser = {
        ...DEMO_USER,
        ...userData,
        id: Date.now(),
      };
      
      const token = 'demo_auth_token_' + Date.now();
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      toast.success('Registration successful! Welcome to SafeRoute Navigator.');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return { 
        success: false, 
        error: 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast.success('Logged out successfully. Stay safe!');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...updates };
      
      // Update stored data
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile.');
      return { 
        success: false, 
        error: 'Update failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, validate current password
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password.');
      return { 
        success: false, 
        error: 'Password change failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password reset link sent to your email!');
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset link.');
      return { 
        success: false, 
        error: 'Reset failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 