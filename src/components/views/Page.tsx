import React from 'react';
import { PermissionsProvider } from '../auth/PermProviderPage';
import ViewForPage from './ViewForPage';

const Vista = ( { pageId } ) => {
  return (
    <PermissionsProvider>
        <ViewForPage pageId={pageId} />
    </PermissionsProvider>
  );
};

export default Vista;
