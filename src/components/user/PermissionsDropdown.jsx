import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function PermissionsDropdown({ permissions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [permissionsState, setPermissions] = useState(permissions);

  const handleCheckboxChange = (id) => {
    setPermissions((prevPermissions) =>
      prevPermissions.map((permission) =>
        permission.id === id ? { ...permission, checked: !permission.checked } : permission
      )
    );
  };

  return (
    <div className="border border-gray-300 rounded-xl shadow-md bg-gray-50 px-4 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-1 bg-gray-50 rounded-md text-gray-700 font-bold"
      >
        <span className="font-bold text-xl">PERMISOS</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="pt-2">
          {permissionsState.map((permission) => (
            <div key={permission.id} className="flex items-center bg-gray-100 p-3 rounded-3xl mb-3 shadow-sm">
              <input
                type="checkbox"
                id={permission.id}
                checked={permission.checked}
                onChange={() => handleCheckboxChange(permission.id)}
                className="mr-2 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={permission.id} className="text-gray-700 font-semibold">
                {permission.label}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
