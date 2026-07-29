import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAI6X6ReUjyqdtcg-sQ0F3gw1Bt1V2peyk",
  authDomain: "dionysus-ed761.firebaseapp.com",
  projectId: "dionysus-ed761",
  storageBucket: "dionysus-ed761.firebasestorage.app",
  messagingSenderId: "493574226466",
  appId: "1:493574226466:web:f183cb67295c27a8cac07b",
  measurementId: "G-X9R1RYELNS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);