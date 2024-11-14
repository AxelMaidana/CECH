import React from 'react';
import { PermissionsProvider } from '../auth/PermissionsProvider';
import EditCourseButton from '../CourseEditor/ButtonEditCourse';

interface VistaProps {
  id: string;
}

const Vista = ({ id }: VistaProps) => {
  return (
    <PermissionsProvider>
      <EditCourseButton id={id} />
    </PermissionsProvider>
  );
};

export default Vista;
