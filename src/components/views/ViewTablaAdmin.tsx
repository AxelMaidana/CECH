import React from 'react';
import { PermissionsProvider } from '../auth/PermissionsProvider';
import UserTable from '../admin/UserTable';

const Vista = () => {
  return (
    <PermissionsProvider>
        <UserTable />
    </PermissionsProvider>
  );
};

export default Vista;
