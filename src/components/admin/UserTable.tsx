import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/client';
import { openModalMiembro, closeModalMiembro, initializeModalMiembro } from '../auth/RegisterModal';

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
  <div className="overflow-hidden rounded-lg shadow-custom">
    <table className="min-w-full divide-y-[3px] divide-black/10 border-collapse separate">{children}</table>
  </div>
);

const TableHeader: React.FC<TableProps> = ({ children }) => (
  <thead className="bg-black/5">{children}</thead>
);

const TableBody: React.FC<TableProps> = ({ children }) => (
  <tbody className="bg-gray-50 divide-y-[3px] divide-black/10">{children}</tbody>
);

const TableRow: React.FC<TableProps> = ({ children }) => <tr>{children}</tr>;

const TableHead: React.FC<TableProps> = ({ children }) => (
  <th scope="col" className="px-6 py-3 text-left text-sm font-base text-customBlack tracking-wider">{children}</th>
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
}

const ITEMS_PER_PAGE = 3;

const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData: User[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          usersData.push({
            id: doc.id,
            name: data.name || '',
            dni: data.dni || '',
            matricula: data.matricula || '',
            lugarDeOrigen: data.lugarDeOrigen || '',
            infoExtra: data.infoExtra || '',
            profileImageUrl: data.profileImageUrl || '',
          });
        });
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Abrir el modal de confirmación
  const handleOpenModalMiembro = () => {
    setIsModalOpen(true);
  };

  // Cerrar el modal de confirmación
  const handleCloseModalMiembro = () => {
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(user =>
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
      setUsers(users.filter(user => user.id !== userId));
      handleCloseModal();
    } catch (error) {
      console.error("Error deleting user: ", error);
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
        });
        setUsers(users.map(user => (user.id === modalUser.id ? modalUser : user))); // Actualizar el usuario en la lista
        handleCloseModal();
      } catch (error) {
        console.error("Error updating user: ", error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof User) => {
    if (modalUser) {
      setModalUser({
        ...modalUser,
        [field]: e.target.value,
      });
    }
  };

    // Inicializar el modal cuando el componente se monta
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeModalMiembro('register-modal');
        }
      };
  
      initializeModalMiembro('register-modal');
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, []);

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
        <Button
          onClick={(e) => {
            e.preventDefault();
            openModalMiembro('register-modal'); // Abre el modal al hacer clic
          }
          }
          className="bg-customBlue text-white px-4 py-3 rounded-2xl text-sm font-semibold"
        >
          Agregar Miembro
        </Button>
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
                <TableHead>Acciones</TableHead>
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
                    <TableCell>
                      <Button onClick={() => handleOpenModal(user)} className="text-blue-600 underline">Editar</Button>
                    </TableCell>
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

      {/* Modal */}
      {modalUser && (
        <div className="fixed inset-0 h-screen bg-black bg-opacity-50 flex items-center justify-center z-50">
          <section>
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Editar Detalles de {modalUser.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
                    DNI
                  </label>
                  <input
                    id="dni"
                    type="text"
                    value={modalUser.dni}
                    onChange={(e) => handleChange(e, 'dni')}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="matricula" className="block text-sm font-medium text-gray-700">
                    Matrícula
                  </label>
                  <input
                    id="matricula"
                    type="text"
                    value={modalUser.matricula}
                    onChange={(e) => handleChange(e, 'matricula')}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="lugarDeOrigen" className="block text-sm font-medium text-gray-700">
                    Lugar de Origen
                  </label>
                  <input
                    id="lugarDeOrigen"
                    type="text"
                    value={modalUser.lugarDeOrigen}
                    onChange={(e) => handleChange(e, 'lugarDeOrigen')}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="infoExtra" className="block text-sm font-medium text-gray-700">
                    Información Extra
                  </label>
                  <textarea
                    id="infoExtra"
                    value={modalUser.infoExtra}
                    onChange={(e) => handleChange(e, 'infoExtra')}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
              <Button 
                onClick={() => handleDeleteUser(modalUser.id)} 
                className="bg-red-500 text-white"
              >
                Eliminar
              </Button>
                <Button onClick={handleCloseModal} className="bg-red-200 text-white">Cerrar</Button>
                <Button onClick={handleSaveChanges} className="bg-blue-600 text-white">Guardar cambios</Button>
              </div>
            </div>
          </section>
        </div>
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
    </div>
  );
};

export default UserTable;
