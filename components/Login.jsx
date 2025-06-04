'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from 'lib/firebase';
import { useCooldownTimer } from './useCooldownTimer';
import { useRouter } from 'next/navigation';

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    const { cooldown, timeLeft, startCooldown, COOLDOWN_MINUTES } = useCooldownTimer();

    const handleLogin = async () => {
        if (cooldown) {
            alert(`Please wait ${timeLeft} seconds before trying again.`);
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful!');
            router.push('/qwdas');
        } catch (error) {
            if (error.code === 'auth/too-many-requests') {
                startCooldown();
                setErrorMessage(`Too many requests. Please wait ${COOLDOWN_MINUTES} minutes.`);
            } else {
                console.error(error);
            }
        }
    };

    const handlePasswordReset = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent!');
        } catch (error) {
            console.log('Password reset error:', error);
        }
    };

    const handleSignup = async () => {
        try {
            // 1. Buat akun di Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Simpan data user ke Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                createdAt: serverTimestamp(),
                role: 'user' // misal default role
            });

            console.log('User signed up and saved to Firestore!');

            router.push('/');
        } catch (error) {
            console.log('Signup error:', error);
            if (error.code === 'auth/email-already-in-use') {
                setErrorMessage('Email already in use, please log in.');
            } else {
                setErrorMessage('Signup error: ' + error.message);
            }
        }
    };

    return (
        <div className="p-4 max-w-sm mx-auto">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <input
                className="border p-2 mb-2 w-full"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className="border p-2 mb-2 w-full"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleLogin}>
                Logins
            </button>

            <button className="bg-green-500 text-white px-4 py-2 rounded mt-2" onClick={handleSignup}>
                Sign Up
            </button>
            {errorMessage && (
                <button className="bg-green-500 text-white px-4 py-2 rounded mt-2" onClick={handlePasswordReset}>
                    reset password
                </button>
            )}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </div>
    );
}
