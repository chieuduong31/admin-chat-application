// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDufM1cAckuYLfgn81lTCmg2wVUiSDyM3U",
  authDomain: "chatbox-b9fba-6267d.firebaseapp.com",
  databaseURL: "https://chatbox-b9fba-default-rtdb.firebaseio.com",
  projectId: "chatbox-b9fba",
  storageBucket: "chatbox-b9fba.appspot.com",
  messagingSenderId: "831904839153",
  appId: "1:831904839153:web:c9a8f642557d71fdc80050",
  measurementId: "G-2CT93SLJ5C"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig)
const db = getFirestore(firebase)

export { firebase, db }
