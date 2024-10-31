import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/client'; 
import { openModal, closeModal, initializeModal } from '../auth/RegisterModal';

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

const InputFilter: React.FC<InputProps> = ({ className, ...props }) => (
  <input
    className={`px-3 py-2 bg-white border shadow-sm border-customGreen placeholder-slate-400 focus:outline-none focus:border-customGreen focus:ring-customGreen block w-full rounded-3xl sm:text-sm focus:ring-1 ${className}`}
    {...props}
  />
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ className, ...props }) => (
  <button
    className={`px-4 py-2 font-semibold text-sm text-gray-600 underline ${className}`}
    {...props}
  />
);

const ButtonPagination: React.FC<ButtonProps> = ({ className, ...props }) => (
  <button
    className={`px-6 py-2 font-semibold text-sm bg-customBlue text-white rounded-full shadow-sm ${className}`}
    {...props}
  />
);

const ButtonPaginationNumber: React.FC<ButtonProps> = ({ className, ...props }) => (
  <button
    className={`flex items-center justify-center w-8 h-8 font-semibold text-sm bg-customBlue text-white rounded-full shadow-sm ${className}`} 
    {...props}
  />
);

interface TableProps {
  children: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ children }) => (
  <div className="overflow-hidden rounded-lg shadow-custom">
    <table className="min-w-full divide-y-[3px] divide-black/10 border-collapse separate">
      {children}
    </table>
  </div>
);

const TableHeader: React.FC<TableProps> = ({ children }) => (
  <thead className="bg-black/5">{children}</thead>
);

const TableBody: React.FC<TableProps> = ({ children }) => (
  <tbody className="bg-gray-50 divide-y-[3px] divide-black/10 line-clamp">{children}</tbody>
);

const TableRow: React.FC<TableProps> = ({ children }) => <tr>{children}</tr>;

const TableHead: React.FC<TableProps> = ({ children }) => (
  <th scope="col" className="px-6 py-3 text-left text-sm font-base text-customBlack tracking-wider">
    {children}
  </th>
);

interface TableCellProps {
  children: React.ReactNode;
  colSpan?: number;
  className?: string;
}

const TableCell: React.FC<TableCellProps> = ({ children, colSpan }) => (
  <td className="px-6 py-2 whitespace-nowrap" colSpan={colSpan}>
    {children}
  </td>
);

const TableCellDescription: React.FC<TableCellProps> = ({ children, colSpan, className }) => (
  <td className={`whitespace-nowrap ${className}`} colSpan={colSpan}>
    {children}
  </td>
);

// Main Component
interface User {
  id: string; // ID como string
  name: string;
  dni: string;
  matricula: string;
  lugarDeOrigen: string;
  infoExtra: string;
  profileImageUrl: string; // Añadido para la URL de la imagen
}

const ITEMS_PER_PAGE = 3;

const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editedUser, setEditedUser] = useState<User | null>(null); // Para almacenar el usuario que se está editando

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
            profileImageUrl: data.profileImageUrl || '', // Carga la URL de la imagen
          });
        });
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  // Inicializar el modal cuando el componente se monta
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal('register-modal');
      }
    };

    initializeModal('register-modal');
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleRowExpansion = (userId: string) => {
    setExpandedRows(prev => 
      prev.includes(userId) ? [] : [userId]
    );
  };

  const handleEditChange = (field: keyof User, value: string) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: value });
    }
  };

  const handleSaveChanges = async (userId: string) => {
    if (editedUser) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        name: editedUser.name,
        dni: editedUser.dni,
        matricula: editedUser.matricula,
        lugarDeOrigen: editedUser.lugarDeOrigen,
        infoExtra: editedUser.infoExtra,
        profileImageUrl: editedUser.profileImageUrl, // Actualiza la URL de la imagen
      });
      // Actualiza la lista de usuarios localmente después de guardar
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, ...editedUser } : user));
      setExpandedRows(prev => prev.filter(id => id !== userId)); // Cierra la fila expandida
      setEditedUser(null); // Limpia el usuario editado
    }
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

  return (
    <div className="space-y-4">
      <div className='flex flex-grid justify-between'>
        <InputFilter
          type="text"
          placeholder="Buscar por nombre, DNI o matrícula"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm border-customGreen rounded-3xl"
        />
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal('register-modal'); // Abre el modal al hacer clic
          }}
          className="bg-customBlue text-white px-4 py-3 rounded-2xl text-sm font-semibold"
        >
          Agregar Miembro
        </a>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Dni</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Lugar de Origen</TableHead>
            <TableHead>Info Extra</TableHead>
            <TableHead>Edición</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map(user => (
              <React.Fragment key={user.id}>
                <TableRow>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.dni}</TableCell>
                  <TableCell>{user.matricula}</TableCell>
                  <TableCell>{user.lugarDeOrigen}</TableCell>
                  <TableCell>{user.infoExtra}</TableCell>
                  <TableCell>
                    <Button
                      className={`transition-all duration-200 ${expandedRows.includes(user.id) ? 'font-bold text-xl' : ''}`}
                      onClick={() => {
                        toggleRowExpansion(user.id);
                        setEditedUser(user); // Establece el usuario que se está editando
                      }}
                    >
                      Mas Detalle
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRows.includes(user.id) && (
                  <TableRow>
                    <TableCellDescription colSpan={6} className="p-0"> 
                      <div className="bg-gray-100 p-10 m-0 rounded-none">
                        <h3 className="font-bold mb-2">Detalles adicionales</h3>
                        <Input 
                          placeholder="Nombre" 
                          defaultValue={user.name} 
                          onChange={(e) => handleEditChange('name', e.target.value)} 
                          className="mb-2" 
                        />
                        <Input 
                          placeholder="DNI" 
                          defaultValue={user.dni} 
                          onChange={(e) => handleEditChange('dni', e.target.value)} 
                          className="mb-2" 
                        />
                        <Input 
                          placeholder="Matrícula" 
                          defaultValue={user.matricula} 
                          onChange={(e) => handleEditChange('matricula', e.target.value)} 
                          className="mb-2" 
                        />
                        <Input 
                          placeholder="Lugar de Origen" 
                          defaultValue={user.lugarDeOrigen} 
                          onChange={(e) => handleEditChange('lugarDeOrigen', e.target.value)} 
                          className="mb-2" 
                        />
                        <Input 
                          placeholder="Información Extra" 
                          defaultValue={user.infoExtra} 
                          onChange={(e) => handleEditChange('infoExtra', e.target.value)} 
                          className="mb-2" 
                        />
                        <Input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (reader.result) {
                                    handleEditChange('profileImageUrl', reader.result as string); // Actualiza la URL de la imagen
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden" // Oculta el input file
                          />
                          <ButtonPagination
                            onClick={() => {
                              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement; // Type assertion
                              fileInput.click(); // Abre el selector de archivos
                            }}
                            className="mb-2"
                          >
                            Subir Imagen
                          </ButtonPagination>
                          <Button onClick={() => handleSaveChanges(user.id)} className="bg-customBlue">Guardar Cambios</Button>
                      </div>
                    </TableCellDescription>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">No se encontraron usuarios.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Paginación */}
      <div className="flex justify-between mt-4">
  <ButtonPagination
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    className="disabled:opacity-10"
    disabled={currentPage === 1}
  >
    Atrás
  </ButtonPagination>
  <div className="flex space-x-2">
    {Array.from({ length: pageCount }, (_, index) => (
      <ButtonPaginationNumber
        key={index + 1}
        onClick={() => setCurrentPage(index + 1)}
        className={`${
          currentPage === index + 1 ? 'opacity-100' : 'opacity-50'
        } bg-blue-200 transition-opacity duration-200`}
      >
        {index + 1}
      </ButtonPaginationNumber>
    ))}
  </div>
  <ButtonPagination
    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
    className="disabled:opacity-10"
    disabled={currentPage === pageCount}
  >
    Siguiente
  </ButtonPagination>
</div>

    </div>
  );
};

export default UserTable;
