import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('scorekid_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Ensure children array exists for backward compatibility
        if (!parsedUser.children) {
          parsedUser.children = [];
        }
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('scorekid_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem('scorekid_users') || '[]');
    const foundUser = users.find((u: User & { password: string }) => 
      u.email === email && u.password === password
    );

    if (foundUser) {
      const userWithoutPassword: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        children: foundUser.children || [],
        createdAt: foundUser.createdAt
      };
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('scorekid_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('scorekid_users') || '[]');
    const existingUser = users.find((u: User & { password: string }) => u.email === email);
    
    if (existingUser) {
      return false; // User already exists
    }

    const newUserWithPassword = {
      id: Date.now().toString(),
      email,
      password,
      name,
      children: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUserWithPassword);
    localStorage.setItem('scorekid_users', JSON.stringify(users));

    const userWithoutPassword: User = {
      id: newUserWithPassword.id,
      email: newUserWithPassword.email,
      name: newUserWithPassword.name,
      children: [],
      createdAt: newUserWithPassword.createdAt
    };

    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem('scorekid_user', JSON.stringify(userWithoutPassword));
    return true;
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('scorekid_user', JSON.stringify(updatedUser));
    
    // Also update in the users array
    const users = JSON.parse(localStorage.getItem('scorekid_users') || '[]');
    const userIndex = users.findIndex((u: User & { password: string }) => u.id === updatedUser.id);
    
    if (userIndex !== -1) {
      // Preserve the password when updating
      users[userIndex] = { ...users[userIndex], ...updatedUser };
      localStorage.setItem('scorekid_users', JSON.stringify(users));
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('scorekid_user');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    // Simulate password reset - in real app this would send an email
    const users = JSON.parse(localStorage.getItem('scorekid_users') || '[]');
    const foundUser = users.find((u: User & { password: string }) => u.email === email);
    return !!foundUser;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      resetPassword,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};