import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function PermissionsDropdown({ permissions }) {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(permissions).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center bg-gray-200 p-3 rounded-xl shadow-sm border border-gray-400 opacity-75"
            >
              <input
                type="checkbox"
                id={key}
                checked={value}
                readOnly
                className="mr-2 w-5 h-5 text-blue-600 border-gray-300 rounded cursor-not-allowed"
              />
              <label
                htmlFor={key}
                className="text-gray-600 font-semibold capitalize cursor-not-allowed"
              >
                {key.replace(/([A-Z])/g, " $1")}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
