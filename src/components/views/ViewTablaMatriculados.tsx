import React from 'react';
import { PermissionsProvider } from '../auth/PermissionsProvider';
import UserTable from '../common/MatriculadosTable';

const Vista = () => {
  return (
    <PermissionsProvider>
        <UserTable />
    </PermissionsProvider>
  );
};

export default Vista;
