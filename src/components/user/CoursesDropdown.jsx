import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function CoursesDropdown({ courses }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-300 rounded-xl shadow-md bg-gray-50 px-4 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-1 bg-gray-50 rounded-md text-gray-700 font-bold"
      >
        <span className="font-bold text-xl">Mis Cursos</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="">
          <p className="text-sm font-semibold text-gray-500 mb-4">
            ¡Recuerda solicitar tus certificados en su respectivo curso para que estén aquí!
          </p>
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={course.id}
                className="flex justify-between items-center bg-gray-100 p-3 rounded-3xl mb-3 shadow-sm"
              >
                <div className="flex items-center">
                  <div className="px-2">
                    <svg className='opacity-50' data-testid="geist-icon" height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16"><path fillRule="evenodd" clipRule="evenodd" d="M3.75 0C2.50736 0 1.5 1.00736 1.5 2.25V13.744V13.75H1.50001C1.50323 14.9899 2.50935 15.994 3.75 15.994H13H14.5V14.494V13.7296V12.994V11.494V0.75V0H13.75H3.75ZM13 11.494V1.5H3.75C3.33579 1.5 3 1.83579 3 2.25V11.622C3.23458 11.5391 3.48702 11.494 3.75 11.494H13ZM3 13.744C3 14.1582 3.33579 14.494 3.75 14.494H13V13.7296V12.994H3.75C3.33579 12.994 3 13.3298 3 13.744Z" fill="currentColor"></path></svg>
                  </div>
                  <span className="text-gray-700 font-semibold">{course.name}</span>
                </div>
                <div className="flex items-center space-x-56">
                  <button className="text-customBlack opacity-70 text-sm font-semibold underline">
                    Descargar Certificado
                  </button>
                  <button className="bg-customBlue text-white px-4 py-1 rounded-full hover:scale-105 transition-all duration-300 ease-in-out">
                    Ir al Curso
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No tienes cursos disponibles en este momento.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CoursesDropdown;
