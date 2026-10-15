import React, { createContext, useContext, useState } from 'react';
import { UserProfile, Role } from '../types';
import { storeService, DEMO_CUSTOMER, DEMO_ADMIN } from '../services/storeService';

interface AuthContextType {
  user: UserProfile | null;
  role: Role;
  isAdmin: boolean;
  login: (email: string, role?: Role) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => storeService.getCurrentUser());

  const login = (email: string, role: Role = 'customer') => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      fullName: email.split('@')[0],
      role,
      createdAt: new Date().toISOString(),
    };
    storeService.setCurrentUser(newUser);
    setUser(newUser);
  };

  const logout = () => {
    storeService.setCurrentUser(null);
    setUser(null);
  };

  const switchRole = (newRole: Role) => {
    const targetUser = newRole === 'admin' ? DEMO_ADMIN : DEMO_CUSTOMER;
    storeService.setCurrentUser(targetUser);
    setUser(targetUser);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    storeService.setCurrentUser(updated);
    setUser(updated);
  };

  const role = user?.role || 'customer';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        login,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
