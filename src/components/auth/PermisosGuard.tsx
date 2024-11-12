// src/components/auth/PermissionGuard.tsx
import React from 'react';

interface PermissionGuardProps {
  requiredPermission: string;
  userPermissions: string[]; // Permisos actuales del usuario, pasados como prop
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ requiredPermission, userPermissions, children }) => {
  if (userPermissions.includes(requiredPermission)) {
    return <>{children}</>;
  }
  return <p>No tienes permiso para ver este contenido.</p>;
};

export default PermissionGuard;
