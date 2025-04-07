import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, collection } from 'firebase/firestore';



// Firebase konfigürasyon bilgilerin
const firebaseConfig = {
  apiKey: "AIzaSyBpEUxhSZPdpheFOL9VuLWsAoL5k_P0QMI",
  authDomain: "digitalassistant-c1767.firebaseapp.com",
  projectId: "digitalassistant-c1767",
  storageBucket: "digitalassistant-c1767.firebasestorage.app",
  messagingSenderId: "840798599716",
  appId: "1:840798599716:web:1cdd0868b088b8924db6b1",
  measurementId: "G-TNJ1X855PT"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini al (Auth ve Firestore gibi)
const auth = getAuth(app);
const db = getFirestore(app);




// Firebase servislerini dışa aktar
export { auth, db };

