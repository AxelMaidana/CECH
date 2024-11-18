import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/client';
import RegisterModal from '../auth/RegisterModal';
import { usePermissions } from '../auth/PermissionsProvider';

// UI Components
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className, ...props }) => (
  <input
    className={`px-3 py-2 bg-white border shadow-sm border-gray-100 placeholder-slate-400 focus:outline-none focus:border-gray-100 focus:ring-gray-200 block w-full rounded-3xl sm:text-sm focus:ring-1 ${className}`}
    {...props}
  />
);

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-6 h-6 border-4 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
    <span className="text-sm text-gray-600">Cargando...</span>
  </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => (
  <button className={`px-4 py-2 font-semibold text-sm ${className}`} {...props} />
);

const ButtonPagination: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => (
  <button className={`px-6 py-2 font-semibold text-sm bg-customBlue text-white rounded-full shadow-sm ${className}`} {...props} />
);

const ButtonPaginationNumber: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => (
  <button className={`flex items-center justify-center w-8 h-8 font-semibold text-sm bg-customBlue text-white rounded-full shadow-sm ${className}`} {...props} />
);

interface TableProps {
  children: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ children }) => (
  <div className="xl:overflow-hidden overflow-x-auto rounded-lg shadow-custom">
    <table className="min-w-full divide-y-[3px] divide-black/10 border-collapse separate">{children}</table>
  </div>
);

const TableHeader: React.FC<TableProps> = ({ children }) => (
  <thead className="bg-black/5 text-center">{children}</thead>
);

const TableBody: React.FC<TableProps> = ({ children }) => (
  <tbody className="bg-gray-50 divide-y-[3px] divide-black/10">{children}</tbody>
);

const TableRow: React.FC<TableProps> = ({ children }) => <tr>{children}</tr>;

const TableHead: React.FC<TableProps> = ({ children }) => (
  <th scope="col" className="px-6 py-3 text-sm font-base text-customBlack tracking-wider text-center">{children}</th>
);

const TableCell: React.FC<TableProps & { colSpan?: number }> = ({ children, colSpan }) => (
  <td className="px-6 py-2 whitespace-nowrap text-center" colSpan={colSpan}>{children}</td>
);

interface User {
  id: string;
  name: string;
  dni: string;
  matricula: string;
  lugarDeOrigen: string;
  infoExtra: string;
  profileImageUrl: string;
  permissions: any;
  role: string;
}

const ITEMS_PER_PAGE = 3;

const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<any>({});
  const [hasChanges, setChanges] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { permissions: userPermissions } = usePermissions();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData: User[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            id: doc.id,
            name: data.name || '',
            dni: data.dni || '',
            matricula: data.matricula || '',
            lugarDeOrigen: data.lugarDeOrigen || '',
            infoExtra: data.infoExtra || '',
            profileImageUrl: data.profileImageUrl || '',
            permissions: data.permissions || {},
            role: data.role || '',
          });
        });
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.dni.includes(searchTerm) ||
      user.matricula.includes(searchTerm)
  );

  const pageCount = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenModal = (user: User) => {
    setModalUser({ ...user }); // Crear una copia del usuario para editar
  };

  const handleCloseModal = () => {
    setModalUser(null);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter((user) => user.id !== userId));
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting user: ', error);
    }
  };

  const handleSaveChanges = async () => {
    if (modalUser) {
      try {
        const userRef = doc(db, 'users', modalUser.id);
        await updateDoc(userRef, {
          dni: modalUser.dni,
          matricula: modalUser.matricula,
          lugarDeOrigen: modalUser.lugarDeOrigen,
          infoExtra: modalUser.infoExtra,
          role: modalUser.role,
        });
        setUsers(users.map((user) => (user.id === modalUser.id ? modalUser : user))); // Actualizar el usuario en la lista
        handleCloseModal();
      } catch (error) {
        console.error('Error updating user: ', error);
      }
    }
  };

  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, // Acepta select también
    field: keyof typeof modalUser
  ) => {
    const value = e.target.value;
    
    // Validar el valor del campo de rol
    if (value !== 'admin' && value !== 'user') {
      setErrorMessage('Solo se permite "admin" o "user"');
    } else {
      setErrorMessage(null); // Limpiar el mensaje de error si es válido
    }

    // Actualizar el estado
    setModalUser({
      ...modalUser,
      [field]: value,
    });
  };
  

  const handleOpenPermissionsModal = (user: User) => {
    setSelectedUser(user);
    setPermissions(user.permissions); // Cargar los permisos actuales del usuario
    setIsPermissionsModalOpen(true);
  };

  const handleClosePermissionsModal = () => {
    setIsPermissionsModalOpen(false);
  };

  const handleSavePermissions = async () => {
    if (selectedUser) {
      try {
        const userRef = doc(db, 'users', selectedUser.id);
        await updateDoc(userRef, {
          permissions: permissions,
        });
        setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, permissions } : user)));
        handleClosePermissionsModal();
        //recargar pagina
        window.location.reload();
      } catch (error) {
        console.error('Error updating permissions: ', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          type="text"
          placeholder="Buscar por nombre, DNI o matrícula"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm border-customGreen rounded-3xl"
        />

        {userPermissions.agregarMiembro && (
          <RegisterModal />
        )}

      </div>
      { loading ? <Spinner/> : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Lugar de Origen</TableHead>
                <TableHead>Info Extra</TableHead>
              {userPermissions.editarMiembro && userPermissions.modificarPermisos && (
                <TableHead>Acciones</TableHead>
              )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.dni}</TableCell>
                    <TableCell>{user.matricula}</TableCell>
                    <TableCell>{user.lugarDeOrigen}</TableCell>
                    <TableCell>{user.infoExtra}</TableCell>
                    {userPermissions.editarMiembro && userPermissions.modificarPermisos && (
                    <TableCell>
                    <div className="flex flex-col text-sm font-semibold gap-y-1">
                    {userPermissions.editarMiembro && (
                    <button 
                      onClick={() => window.location.href = `/admin/perfil/${user.id}`} // Redirige al perfil del usuario usando su ID
                      className="text-customBlue underline hover:text-cyan-900">
                      Perfil
                    </button>
                    )}
                    {userPermissions.modificarPermisos && (
                      <button onClick={() => handleOpenPermissionsModal(user)} className="text-customBlue underline hover:text-cyan-900">
                      Permisos
                    </button>
                    )}
                    </div>
                  </TableCell>
                  )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} children={''}></TableCell>
                </TableRow>
              )}
            </TableBody>
            </Table>
      )}

      {/* Paginate Buttons */}
      <div className="mt-4 flex justify-between items-center">
        <ButtonPagination
          onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
          className="text-sm font-semibold"
        >
          Anterior
        </ButtonPagination>
        <div className="flex gap-2">
          {Array.from({ length: pageCount }, (_, index) => (
            <ButtonPaginationNumber
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={currentPage === index + 1 ? 'bg-customBlue' : 'bg-gray-300 text-black'}
            >
              {index + 1}
            </ButtonPaginationNumber>
          ))}
        </div>
        <ButtonPagination
          onClick={() => setCurrentPage(currentPage < pageCount ? currentPage + 1 : pageCount)}
          className="text-sm font-semibold"
        >
          Siguiente
        </ButtonPagination>
      </div>

      {isPermissionsModalOpen && selectedUser && (
  <div className="fixed -inset-4 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
    <div className="bg-white text-customBlack p-8 sm:p-10 md:p-12 rounded-3xl shadow-lg max-w-7xl w-full transform transition-all duration-300 scale-100 opacity-100 translate-y-0 relative animate-fadeIn">
      
      {/* Botón de cerrar */}
      <svg
        onClick={handleClosePermissionsModal}
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-4 right-4 h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-800"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>

      <h2 className="text-3xl text-customBlue sm:text-4xl text-center font-bold mb-12">
        Editar Permisos de <span className="font-bold text-gray-600">{selectedUser.name}</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {Object.keys(permissions).map(permission => (
          <div key={permission} className="flex items-center space-x-3 min-w-[250px]">
            <input
              type="checkbox"
              checked={permissions[permission]}
              onChange={(e) =>
                setPermissions({
                  ...permissions,
                  [permission]: e.target.checked,
                })
              }
              className={`form-checkbox h-6 w-6 border-gray-300 rounded-md focus:ring-2 ${
                permissions[permission] ? 'text-customGreen border-customGreen' : 'text-blue-600 focus:ring-blue-500'
              }`}
            />
            <span
              className={`text-md font-medium ${
                permissions[permission] ? 'text-customGreen' : 'text-gray-700'
              }`}
            >
              {permission.replace(/([A-Z])/g, ' $1').toUpperCase()}
            </span>
          </div>
        )
        
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-6">
        <Button
          onClick={handleClosePermissionsModal}
          className="bg-gray-300 hover:bg-gray-400 text-black px-8 py-3 rounded-lg font-semibold transition duration-200"
        >
          Cancelar
        </Button>
        {userPermissions.modificarPermisos && (
          <Button
          onClick={handleSavePermissions}
          className="bg-customBlue hover:bg-cyan-800 text-white px-8 py-3 rounded-lg font-semibold transition duration-200"
        >
          Guardar Cambios
        </Button>
        )}
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default UserTable;
