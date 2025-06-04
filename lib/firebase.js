import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyDS-_jkanym57bLxXpC_YzhhWswR7UJ7B8',
    authDomain: 'pogo-raid-tracker-105db.firebaseapp.com',
    projectId: 'pogo-raid-tracker-105db',
    storageBucket: 'pogo-raid-tracker-105db.appspot.com',
    messagingSenderId: '463975256916',
    appId: '1:463975256916:web:be2c78d16fb2dcd71aaec1',
    measurementId: 'G-GELV8C578S'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
