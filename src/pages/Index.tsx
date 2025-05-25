
import { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Dashboard from '@/components/Dashboard';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const IndexContent = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <IndexContent />
      </div>
    </AuthProvider>
  );
};

export default Index;
