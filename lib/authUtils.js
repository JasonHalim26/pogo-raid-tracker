// lib/authUtils.ts
import localforage from 'localforage';
import { auth } from './firebase';

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const getUserDataFromDB = async (uid) => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.warn('No such user in Firestore!');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user from Firestore:', error);
        return null;
    }
};

export const saveAuthToStorage = async () => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        const data = {
            uid: user.uid,
            email: user.email,
            token
        };
        await localforage.setItem('authUser', data);
        return data;
    }
    return null;
};

export const getAuthFromStorage = async () => {
    return await localforage.getItem('authUser');
};

export const clearAuthStorage = async () => {
    await localforage.removeItem('authUser');
};
