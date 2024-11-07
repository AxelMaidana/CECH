import React from 'react';

interface CardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  isFocused: boolean;
}

const Card: React.FC<CardProps> = ({ id, title, description, imageUrl, date, isFocused }) => {
  return (
    <div
      className={`card bg-white text-white rounded-2xl shadow-lg overflow-visible shadow-black/40 transition-transform duration-300 
      ${isFocused ? 'scale-105' : 'scale-95'} flex flex-col h-full`}
    >
      <a href={`/noticias/noticia/${id}`} className="relative z-20">
        {/* Campo de fecha flotante */}
        <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 px-4 py-1 text-md font-semibold bg-customBlue text-white rounded-full z-10">
          {date}
        </div>

        {/* Imagen con borde y altura ajustada */}
        <div className="relative w-full h-40 overflow-hidden rounded-t-2xl border-4 border-customBlue">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-2xl">
              {/* Placeholder para la imagen */}
            </div>
          )}
        </div>
      </a>

      {/* Contenedor de información */}
      <div className="p-4 bg-customBlue rounded-b-2xl flex flex-col flex-grow">
        {/* Título con line-clamp-2 */}
        <h2 className="text-md font-bold text-white text-center mb-2 line-clamp-2 h-14">{title}</h2>

        <div className="flex justify-end items-end">
          <a href={`/noticias/noticia/${id}`} className="underline text-sm font-semibold">
            Leer más
          </a>
        </div>
      </div>
    </div>
  );
};

export default Card;
