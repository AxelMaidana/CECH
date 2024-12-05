import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Definir icono personalizado
const customIcon = L.icon({
  iconUrl: 'https://img.icons8.com/?size=100&id=52671&format=png&color=000000',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

// Definimos nuestras ubicaciones
const locations = [
  {
    id: 1,
    name: 'San Fernando 156, Resistencia, Chaco',
    HorariosTitle: 'Horarios de Atención',
    coordinates: [-27.441302409202233, -58.99488301349367] as [number, number],
    image: '/media/mapa.png',
    description: 'Martes y jueves de 18:00hs a 20:00hs',
    HorariosCelularTitle: 'Horarios de Atención Celular',
    descriptionCelular: 'Lunes a viernes de 09:00hs a 12:00hs y de 18:00hs a 20:00hs',
  },
];

// Componente para actualizar la vista del mapa con animación
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 16, {
      animate: true,
      duration: 1.5, // Duración de la animación en segundos
    });
  }, [center, map]);

  return null;
}

export default function LocationMap() {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);

  return (
    <section 
      className="relative bg-cover bg-center pt-12 pb-28" 
      style={{ backgroundImage: "url('/media/mapa.png')" }}
    >
      <div className="absolute inset-0 bg-black opacity-80"></div>

      <div className="relative mx-0 w-max z-10">
        <h3 className="text-2xl font-bold mb-6 bg-customGreen text-white px-8 py-2.5 rounded-r-full text-center">
          Nuestra Ubicación
        </h3>
      </div>

      <div className="relative mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Primera columna: Lista de ubicaciones */}
          <div className="flex flex-col space-y-4 w-full lg:w-1/4 order-2 lg:order-1">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={`flex items-center justify-center w-full text-white/80 hover:text-white hover:bg-white/10 hover:scale-105 lg:hover:scale-110 transition-all duration-300 ease-in-out rounded-lg p-2 sm:mr-0 md:px-6 ${selectedLocation.id === location.id ? 'bg-white/20' : ''}`}
              >
                <div className="flex-grow text-left pr-2">
                  <h4 className="text-sm lg:text-xs xl:text-base font-semibold">{location.name}</h4>
                </div>
                <div className="w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 rounded-full overflow-hidden">
                  <img 
                    src={location.image} 
                    alt={location.name} 
                    className="w-full h-full object-cover rounded-full border-2 border-customBlue hover:border-[3px] hover:border-customGreen" 
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Segunda columna: Mapa interactivo */}
          <div className="w-full lg:w-2/4 order-1 lg:order-2 z-30">
            <div className="relative bg-customBlue p-1 rounded-lg shadow-md overflow-hidden">
              <MapContainer 
                style={{ height: '400px', width: '100%' }}
                center={selectedLocation.coordinates}
                zoom={16}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                />
                <ZoomControl position="bottomright" />
                <Marker position={selectedLocation.coordinates} icon={customIcon} />
                <ChangeView center={selectedLocation.coordinates} />
              </MapContainer>
            </div>
          </div>

          {/* Tercera columna: Descripción de la ubicación */}
          <div className="w-full lg:w-1/4 order-3">
            <div className="p-4 rounded-lg text-white text-center lg:text-start">
              <h4 className="text-2xl font-bold">{selectedLocation.HorariosTitle}</h4>
              <p className="text-white opacity-85 mt-1 break-words text-md font-medium">
                {selectedLocation.description}
              </p>
              <h4 className="text-xl font-bold mt-4">{selectedLocation.HorariosCelularTitle}</h4>
              <p className="text-white opacity-85 mt-1 break-words text-md font-medium">
                {selectedLocation.descriptionCelular}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
