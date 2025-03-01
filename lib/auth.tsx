'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    role: 'security' | 'resident'
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Security Guard',
    email: 'security@example.com',
    role: 'security',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'John Resident',
    email: 'resident@example.com',
    role: 'resident',
    apartmentNumber: '101',
    createdAt: new Date(),
  },
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('secureGateUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    role: 'security' | 'resident'
  ) => {
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find user with matching email and role
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.role === role
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('secureGateUser', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }

    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('secureGateUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
