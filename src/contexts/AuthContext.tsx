
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id_usuario: number;
  nombre_usuario: string;
  rol: 'admin' | 'empleado';
  id_cliente: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - in real app this would connect to your backend
const mockUsers: User[] = [
  { id_usuario: 1, nombre_usuario: 'admin', rol: 'admin', id_cliente: 1 },
  { id_usuario: 2, nombre_usuario: 'empleado', rol: 'empleado', id_cliente: 1 }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app this would call your API
    const foundUser = mockUsers.find(u => u.nombre_usuario === username);
    if (foundUser && (password === 'admin' || password === 'empleado')) {
      setUser(foundUser);
      localStorage.setItem('pos_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout
    }}>
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
