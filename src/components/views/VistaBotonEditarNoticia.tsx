import React from 'react';
import { PermissionsProvider } from '../auth/PermissionsProvider';
import EditNoticiaButton from '../noticias/ButtonEditNoticia';

interface VistaProps {
  id: string;
}

const Vista = ({ id }: VistaProps) => {
  return (
    <PermissionsProvider>
      <EditNoticiaButton id={id} />
    </PermissionsProvider>
  );
};

export default Vista;
