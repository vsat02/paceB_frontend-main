// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  // apiKey: "AIzaSyDzGBFgmFc_FGKkSPZBPwuOzQBKi3l-wps",
  // authDomain: "medical-iot-969c7.firebaseapp.com",
  // projectId: "medical-iot-969c7",
  // storageBucket: "medical-iot-969c7.appspot.com",
  // messagingSenderId: "995422367850",
  // appId: "1:995422367850:web:28a7f367b12167b892da13"
  apiKey: "AIzaSyDfV7PryPZB-c3KFVXF0KSKm2-VC4tkXLs",
  authDomain: "paceb-41ea3.firebaseapp.com",
  projectId: "paceb-41ea3",
  storageBucket: "paceb-41ea3.appspot.com",
  messagingSenderId: "29828469698",
  appId: "1:29828469698:web:b36bddea21af42ac35bc5b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth()   