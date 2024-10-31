import React from 'react'

interface CardProps {
  title: string
  imageUrl: string
  date: string
  isFocused: boolean // Seguimos usando el prop para determinar si la tarjeta está en foco
}

const Card: React.FC<CardProps> = ({ title, imageUrl, date, isFocused }) => {
  return (
    <div
      className={`h-full flex flex-col mb-3 bg-customBlue rounded-2xl overflow-visible shadow-lg transform transition duration-300 
      ${isFocused ? 'scale-105 lg:scale-100' : 'scale-95 lg:scale-100'} 
      ${isFocused ? 'opacity-100' : 'opacity-50 lg:opacity-100'}  // Aplica opacidad en pantallas menores a 1024px
      min-h-[200px] sm:min-h-[220px] md:min-h-[240px] lg:min-h-[260px] xl:min-h-[280px] min-w-[200px] sm:min-w-[250px] md:min-w-[300px] relative`}
    >
      {/* Contenedor para la fecha */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-customBlue text-white font-base text-sm tracking-wider px-3 py-1 rounded-full shadow-md z-10">
        {date}
      </div>

      {/* Contenedor de la imagen con altura más baja */}
      <div className="h-32 sm:h-28 md:h-32 lg:h-36 xl:h-40 overflow-hidden border-4 border-customBlue rounded-t-2xl">
        <img 
          className="w-full h-full object-top object-cover"
          src={imageUrl} 
          alt={title}
        />
      </div>
      
      {/* Contenedor del contenido más comprimido y centrado */}
      <div className="w-full h-24 p-2 lg:p-2 xl:p-2 flex justify-center items-center">
        <h3 className="font-bold text-white text-md mb-1 line-clamp-3 text-center">{title}</h3>
      </div>
    </div>
  )
}

export default Card
