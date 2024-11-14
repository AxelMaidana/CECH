import { usePermissions } from '../auth/PermProviderPage';
import EditorComponent from '../common/Editor';

export default function PageContent({ pageId }) {
  const { permissions, loading } = usePermissions();

  if (loading) return <p>Cargando...</p>;

  return (
      <div className="flex justify-center items-start w-full max-w-7xl mx-auto mt-6 mb-12 ">
        <main className="flex-1 flex flex-col justify-start items-start">
          {permissions[pageId] ? ( // Verificar permiso específico para pageId
            <EditorComponent pageId={pageId} />
          ) : (
            <p>No tienes permiso para editar esta página.</p>
          )}
        </main>
      </div>
  );
}
