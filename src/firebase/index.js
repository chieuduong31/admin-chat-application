// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAlWaCDcPGmPQ7cx2b4jY059glmkVQNcSM',
  authDomain: 'chat-application-56c11.firebaseapp.com',
  projectId: 'chat-application-56c11',
  storageBucket: 'chat-application-56c11.appspot.com',
  messagingSenderId: '1065471895110',
  appId: '1:1065471895110:web:d49cbf8d21e5e3a9014c47'
}

// Initialize Firebase
const firebase = initializeApp(firebaseConfig)
const db = getFirestore(firebase)

export { firebase, db }
