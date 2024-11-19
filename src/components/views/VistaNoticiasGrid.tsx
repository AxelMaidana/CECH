import { PermissionsProvider } from '../auth/PermissionsProvider';
import { db } from '../../firebase/client';
import { collection, getDocs } from 'firebase/firestore';
import Card from '../noticias/Card';

const postsCollection = collection(db, 'noticias');
const querySnapshot = await getDocs(postsCollection);
const posts = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

const Vista = () => {
  return (
    <PermissionsProvider>
        <div className="grid gap-10 p-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 lg:mx-6 lg:gap-x-8 xl:grid-cols-4 2xl:grid-cols-4 mt-10 mb-16">
          {posts.map((post) => (
            <Card
              key={post.id}
              title={post.title}
              description={post.description}
              imageUrl={post.imageUrl}
              date={post.date}
              id={post.id}
            />
          ))}
        </div>
    </PermissionsProvider>
  );
};

export default Vista;
