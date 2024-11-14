import React from 'react';
import { PermissionsProvider } from '../auth/PermissionsProvider';
import CreateCourseButton from '../common/CreateCourseButton';

const Vista = () => {
  return (
    <PermissionsProvider>
      <CreateCourseButton />
    </PermissionsProvider>
  );
};

export default Vista;
