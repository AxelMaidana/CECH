import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { db } from '../../firebase/client';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import Card from '../noticias/CardCarrousel';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

interface Noticia {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  description: string;
}

const InfiniteCarrousel: React.FC = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const q = query(
          collection(db, 'noticias'),
          orderBy('date', 'desc'),
          limit(7)
        );
        const querySnapshot = await getDocs(q);
        const fetchedNoticias = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Noticia[];
        setNoticias(fetchedNoticias);
      } catch (error) {
        console.error('Error al obtener las noticias:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Cargando noticias...</div>;
  }

  return (
    <Swiper
      modules={[Pagination, Navigation, Autoplay]}
      loop={true}
      centeredSlides={true}
      pagination={{ clickable: true }}
      navigation
      autoplay={{
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      }}
      breakpoints={{
        320: { slidesPerView: 1.3, spaceBetween: 10 },
        375: { slidesPerView: 1.4, spaceBetween: 15 },
        425: { slidesPerView: 1.5, spaceBetween: 20 },
        640: { slidesPerView: 1.5, spaceBetween: 20 },
        768: { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 2.5, spaceBetween: 30 },
        1280: { slidesPerView: 3, spaceBetween: 30 },
        1440: { slidesPerView: 3.5, spaceBetween: 30 },
        1600: { slidesPerView: 4.5, spaceBetween: 50 },
        1920: { slidesPerView: 5.2, spaceBetween: 80 },
      }}
      className="mySwiper overflow-visible"
    >
      {noticias.map((noticia, index) => (
        <SwiperSlide key={noticia.id} className="py-8 h-auto">
          <Card
            id={noticia.id}
            title={noticia.title}
            date={noticia.date}
            imageUrl={noticia.imageUrl}
            description={noticia.description}
            isFocused={index === null}
          />
        </SwiperSlide>
      ))}

      {/* Estilos para los botones de navegación */}
      <style>{`
        .swiper-button-next, .swiper-button-prev {
          background-color: white; /* Ejemplo de color de fondo */
          border-radius: 50%; /* Hacerlos redondos */
          width: 40px; /* Tamaño */
          height: 40px; /* Tamaño */
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .swiper-button-next::after, .swiper-button-prev::after {
          color: #187498; /* Color de las flechas */
          font-size: 20px;
          font-weight: bold;
        }
      `}</style>
    </Swiper>
  )
}

export default InfiniteCarrousel;
