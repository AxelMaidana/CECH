import { db } from '../../firebase/client'; 
import { doc, getDoc, getDocs } from 'firebase/firestore';

export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const userDoc = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      return userSnapshot.data().role || null;
    } else {
      console.log('No se encontró el usuario');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener el rol del usuario:', error);
    return null;
  }
}