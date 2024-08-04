// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEFWJ_JEIUQ4nJyz5meiWlhZN5qp5xXIw",
  authDomain: "inventory-management-94014.firebaseapp.com",
  projectId: "inventory-management-94014",
  storageBucket: "inventory-management-94014.appspot.com",
  messagingSenderId: "317056948245",
  appId: "1:317056948245:web:8b014709edd0f9adb2961c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const firestore = getFirestore(app);

export {firestore}