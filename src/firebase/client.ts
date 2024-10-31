import { initializeApp } from "firebase/app"; // Importa la app
import { getAuth } from "firebase/auth"; // Importa la autenticación
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC0PuEh7IRp1BHe5W495zU64A6ijgVL6ew",
  authDomain: "colegio-f77d0.firebaseapp.com",
  projectId: "colegio-f77d0",
  storageBucket: "colegio-f77d0.appspot.com",
  messagingSenderId: "95589408977",
  appId: "1:95589408977:web:91cfdbbc954dda999ea5f0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);