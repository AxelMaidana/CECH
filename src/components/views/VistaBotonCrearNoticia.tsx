import React from 'react';
import { PermissionsProvider } from '../auth/PermissionsProvider';
import CreateNoticiaButton from '../common/CreateNoticiaButton';

const Vista = () => {
  return (
    <PermissionsProvider>
      <CreateNoticiaButton />
    </PermissionsProvider>
  );
};

export default Vista;
