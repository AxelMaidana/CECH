import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation, Autoplay } from 'swiper/modules'
import Card from './Card'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const cardData = [
  { title: "Evento 1: Conferencia de Enfermería", imageUrl: "/media/image1.png", date: "01/02/24" },
  { title: "Evento 2: Taller de Primeros Auxilios", imageUrl: "/media/image3.png", date: "01/02/24" },
  { title: "Evento 3: Seminario de Ética en Enfermería", imageUrl: "/media/image1.png", date: "01/02/24" },
  { title: "Evento 4: Curso de Actualización en Cuidados Intensivos", imageUrl: "/media/image3.png", date: "01/02/24" },
  { title: "Evento 5: Jornada de Salud Mental", imageUrl: "/media/image1.png", date: "01/02/24" },
  { title: "Evento 6: Taller de Primeros Auxilios", imageUrl: "/media/image3.png", date: "01/02/24" },
  { title: "Evento 7: Seminario de Ética en Enfermería", imageUrl: "/media/image1.png", date: "01/02/24" },
  { title: "Evento 8: Curso de Actualización en Cuidados Intensivos", imageUrl: "/media/image3.png", date: "01/02/24" },
  { title: "Evento 9: Jornada de Salud Mental", imageUrl: "/media/image1.png", date: "01/02/24" },
]

const InfiniteCarrousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0) // Estado para el índice activo

  return (
    <Swiper
      modules={[Pagination, Navigation, Autoplay]}
      loop={true}
      centeredSlides={true}
      pagination={{ clickable: true }}
      navigation
      autoplay={{ delay: 2000, disableOnInteraction: false }}
      onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)} // Actualizamos el índice activo cuando cambia la slide
      breakpoints={{
        320: {
          slidesPerView: 1.3,
          spaceBetween: 10,
        },
        375: {
          slidesPerView: 1.4,
          spaceBetween: 15,
        },
        425: {
          slidesPerView: 1.5,
          spaceBetween: 20,
        },
        640: {
          slidesPerView: 1.5,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 2.5,
          spaceBetween: 30,
        },
        1280: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        1440: {
          slidesPerView: 3.5,
          spaceBetween: 30,
        },
        1600: {
          slidesPerView: 4.5,
          spaceBetween: 50,
        },
        1920: {
          slidesPerView: 5.2,
          spaceBetween: 80,
        },
      }}
      className="mySwiper overflow-visible"
    >
      {cardData.map((card, index) => (
        <SwiperSlide key={index} className="py-8 h-auto">
          <Card
            title={card.title}
            date={card.date}
            imageUrl={card.imageUrl}
            isFocused={index === activeIndex} // Determina si la tarjeta está en foco
          />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default InfiniteCarrousel
