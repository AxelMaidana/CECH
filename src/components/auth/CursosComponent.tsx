import React from 'react';
import { usePermissions } from './PermissionsProvider';

export const CursosComponent = () => {
  const { permissions, loading, userId } = usePermissions();

  if (loading) {
    return <div className="p-6 bg-white rounded-lg shadow-lg mt-4">Cargando...</div>;
  }

  if (!userId) {
    return <div className="p-6 bg-white rounded-lg shadow-lg mt-4">Por favor inicia sesión para ver los cursos.</div>;
  }

  if (!permissions.verCursos) {
    return <div className="p-6 bg-white rounded-lg shadow-lg mt-4">No tienes permisos para ver los cursos.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg mt-4">
      <h2 className="text-2xl font-bold mb-4">Cursos Disponibles</h2>
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h3 className="text-xl font-semibold">Curso de React</h3>
          <p className="text-gray-600">Descripción del curso de React</p>
          {permissions.editarCursos && (
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Editar Curso
            </button>
          )}
          {permissions.eliminarCurso && (
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Eliminar Curso
            </button>
          )}
        </div>

        <div className="border p-4 rounded">
          <h3 className="text-xl font-semibold">Curso de Astro</h3>
          <p className="text-gray-600">Descripción del curso de Astro</p>
          {permissions.editarCursos && (
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Editar Curso
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
