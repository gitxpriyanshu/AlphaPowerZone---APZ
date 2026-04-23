import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useOwnerStore } from '../store/ownerStore';

const OwnerGuard: React.FC = () => {
  const { isAuthenticated } = useOwnerStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default OwnerGuard;
