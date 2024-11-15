interface CardProps {
  title: string;
  imageUrl: string;
  date: string;
  id: string;
}

const Card: React.FC<CardProps> = ({ title, imageUrl, date, id }) => {
  return (
    <a href={`/noticias/noticia/${id}`} className="block group max-w-[300px] h-full">
      <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
        {/* Imagen con tamaño fijo */}
        <div className="relative overflow-hidden rounded-t-lg h-40">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <time className="text-sm text-gray-500 block">{date}</time>
        </div>
      </article>
    </a>
  );
};

export default Card;
