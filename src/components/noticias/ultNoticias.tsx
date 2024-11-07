interface CardProps {
  title: string;
  imageUrl: string;
  date: string;
  id: string;
}

const Card: React.FC<CardProps> = ({ title, imageUrl, date, id }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row my-3 sm:w-80 w-full">
      <img src={imageUrl} alt={title} className="w-full sm:w-40 h-40 object-cover rounded-t-lg sm:rounded-l-lg" />
      <div className="p-4 flex-1">
        <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">{title}</h3>
        <p className="text-xs text-gray-400 mt-1">{date}</p>
        <a href={`/noticias/noticia/${id}`} className="text-customBlue mt-4 inline-block text-sm font-semibold hover:underline">
          Leer más
        </a>
      </div>
    </div>
  );
};

export default Card;
