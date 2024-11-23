import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase/client';
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
  <div className="w-full xl:overflow-hidden overflow-x-auto rounded-lg shadow-custom">
    <table className="w-full min-w-full divide-y-[3px] divide-black/10 border-collapse separate">{children}</table>
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
    apellido: string;
    nombre: string;
    dni: string;
    matricula: string;
    cargo: string;
    permissions: any;
}
  
const ITEMS_PER_PAGE = 10;
  
const UserTable = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [recordsLimit, setRecordsLimit] = useState(10);
    const { permissions: userPermissions } = usePermissions();
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          let q = query(collection(db, 'users'), limit(recordsLimit));
  
          const querySnapshot = await getDocs(q);
          const usersData: User[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            usersData.push({
              id: doc.id,
              apellido: data.lastname || '',
              nombre: data.name || '',
              dni: data.dni || '',
              matricula: data.matricula || '',
              cargo: data.infoExtra || '',
              permissions: data.permissions || {},
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
    }, [recordsLimit]);
  
    const filteredUsers = users.filter(
      (user) =>
        user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.dni.includes(searchTerm) ||
        user.matricula.includes(searchTerm) ||
        user.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const paginatedUsers = filteredUsers;
  
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Input
            type="text"
            placeholder="Buscar por apellido, nombre, DNI o matrícula"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm border-customGreen rounded-3xl"
          />
  
          <div className="flex items-center gap-2">
            <span>Mostrar</span>
            <select
              value={recordsLimit}
              onChange={(e) => setRecordsLimit(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>registros</span>
          </div>
        </div>
  
        {loading ? <Spinner /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apellido</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Cargo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.apellido}</TableCell>
                    <TableCell>{user.nombre}</TableCell>
                    <TableCell>{user.dni}</TableCell>
                    <TableCell>{user.matricula}</TableCell>
                    <TableCell>{user.cargo}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>No se encontraron registros</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
  
        {/* Pagination controls - keep the same */}
        <div className="mt-4 flex justify-between items-center">
          <ButtonPagination
            onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
            className="text-sm font-semibold"
          >
            Anterior
          </ButtonPagination>
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(paginatedUsers.length / ITEMS_PER_PAGE) }, (_, index) => (
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
            onClick={() => setCurrentPage(currentPage < Math.ceil(paginatedUsers.length / ITEMS_PER_PAGE) ? currentPage + 1 : Math.ceil(paginatedUsers.length / ITEMS_PER_PAGE))}
            className="text-sm font-semibold"
          >
            Siguiente
          </ButtonPagination>
        </div>
      </div>
    );
  };
  
  export default UserTable;
