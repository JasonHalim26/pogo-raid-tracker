'use client';

import Login from 'components/Login';
import { useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';

export default function Profile() {
    const [username, setUsername] = useState('');
    const [level, setLevel] = useState('');
    const [loading, setLoading] = useState(false);
    const [usernamePreview, setUsernamePreview] = useState('');
    const [levelPreview, setLevelPreview] = useState('');

    const [userId, setUserId] = useState('');
    const [userIdPreview, setUserIdPreview] = useState('');

    const processImage = (img, type) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const imgWidth = img.width;
        const imgHeight = img.height;

        let levelBox = {
            x: imgWidth * 0.05,
            y: imgHeight * 0.798,
            w: imgWidth * 0.1,
            h: imgHeight * 0.06
        };

        let usernameBox = {
            x: imgWidth * 0.05,
            y: imgHeight * 0.2,
            w: imgWidth * 0.8,
            h: imgHeight * 0.15
        };

        let userIdBox = {
            x: imgWidth * 0.05,
            y: imgHeight * 0.2,
            w: imgWidth * 0.8,
            h: imgHeight * 0.15
        };

        if (imgWidth === 1284) {
            usernameBox = {
                x: imgWidth * 0.05,
                y: imgHeight * 0.15,
                w: imgWidth * 0.8,
                h: imgHeight * 0.08
            };

            levelBox = {
                x: imgWidth * 0.05,
                y: imgHeight * 0.53,
                w: imgWidth * 0.12,
                h: imgHeight * 0.04
            };

            userIdBox = {
                x: imgWidth * 0.2,
                y: imgHeight * 0.252,
                w: imgWidth * 0.5,
                h: imgHeight * 0.04
            };
        }

        const extractRegionText = async ({ x, y, w, h }, setPreview, splitResult = true) => {
            canvas.width = w;
            canvas.height = h;
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

            const imageData = ctx.getImageData(0, 0, w, h);
            for (let i = 0; i < imageData.data.length; i += 4) {
                const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
                imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = avg;
            }
            ctx.putImageData(imageData, 0, 0);

            const dataURL = canvas.toDataURL();
            setPreview(dataURL);

            const result = await Tesseract.recognize(dataURL, 'eng', {
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '
            });

            let cleanedText = result.data.text.trim();

            if (splitResult) {
                const firstLine = cleanedText.split('\n')[0];
                const firstWord = firstLine.split(' ')[0];
                return firstWord || cleanedText;
            }

            cleanedText = cleanedText.split(' ');
            cleanedText.length = 3;
            cleanedText = cleanedText.join('');

            return cleanedText;
        };

        if (type === 'id') {
            return extractRegionText(userIdBox, setUserIdPreview, false);
        }

        return Promise.all([
            extractRegionText(usernameBox, setUsernamePreview),
            extractRegionText(levelBox, setLevelPreview)
        ]);
    };

    const handleImageUpload = async (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = async () => {
            setLoading(true);
            try {
                if (type === 'user_id') {
                    const userId = await processImage(img, 'id');
                    setUserId(userId || 'Not found');
                } else {
                    const [rawUsername, rawLevel] = await processImage(img, type);
                    const levelMatch = rawLevel.match(/(\d{1,3})/);
                    setUsername(rawUsername || 'Not found');
                    setLevel(levelMatch?.[1] || 'Not found');
                }
            } catch (err) {
                console.error('OCR failed:', err);
                setUsername('Error');
                setLevel('Error');
            }
            setLoading(false);
        };
    };

    // DEV MODE AUTOLOAD
    useEffect(() => {
        console.log(' 🚀 ༼;´༎ຶ ۝ ༎ຶ༽ ~  (ノ ° 益 °) ノ ~ (っ◔◡◔)っ ~   ~ process.env.NODE_ENV:', process.env.NODE_ENV);
        if (process.env.NODE_ENV === 'development') {
            const img = new Image();
            // img.src = '/images/testing.png';
            img.src = '/images/test.png';
            img.onload = async () => {
                setLoading(true);
                try {
                    const [rawUsername, rawLevel] = await processImage(img);
                    const levelMatch = rawLevel.match(/(\d{1,3})/);
                    setUsername(rawUsername || 'Not found');
                    setLevel(levelMatch?.[1] || 'Not found');
                } catch (err) {
                    console.error('OCR failed:', err);
                    setUsername('Error');
                    setLevel('Error');
                }
                setLoading(false);
            };
            //image 2
            const img2 = new Image();
            img2.src = '/images/test2.png';

            img2.onload = async () => {
                setLoading(true);
                try {
                    const userId = await processImage(img2, 'id');
                    setUserId(userId || 'Not found');
                } catch (err) {
                    console.error('OCR failed:', err);
                    setUserId('Error');
                }
                setLoading(false);
            };
        }
    }, []);

    // const handleSignup = async () => {
    //     try {
    //         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //         const user = userCredential.user;

    //         // Save additional data to Firestore
    //         await setDoc(doc(db, 'users', user.uid), {
    //             email: user.email,
    //             username,
    //             level: parseInt(level),
    //             accountId,
    //             createdAt: serverTimestamp(),
    //             role: 'user'
    //         });

    //         console.log('User signed up and saved to Firestore!');
    //         router.push('/');
    //     } catch (error) {
    //         console.log('Signup error:', error);
    //         if (error.code === 'auth/email-already-in-use') {
    //             setErrorMessage('Email already in use, please log in.');
    //         } else {
    //             setErrorMessage('Signup error: ' + error.message);
    //         }
    //     }
    // };

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">Upload Pokémon GO Screenshot</h2>
            <div>
                <p> STEP 1 Upload a screenshot of your Pokémon GO screen to extract your username and level.</p>
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'username_and_level')} />
            {loading && <p>Detecting text, please wait...</p>}

            {(usernamePreview || levelPreview) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {usernamePreview && (
                        <div>
                            <h3 className="font-semibold">Username Box</h3>
                            <img src={usernamePreview} alt="Username crop" className="border border-gray-400" />
                        </div>
                    )}
                    {levelPreview && (
                        <div>
                            <h3 className="font-semibold">Level Box</h3>
                            <img src={levelPreview} alt="Level crop" className="border border-gray-400" />
                        </div>
                    )}
                </div>
            )}

            {!loading && (username || level) && (
                <div className="mt-4 space-y-2">
                    <p>
                        <strong>Username:</strong> {username}
                    </p>
                    <p>
                        <strong>Level:</strong> {level}
                    </p>
                </div>
            )}

            {/* //STEP 2 */}

            <div>
                <p> STEP 2 Upload a screenshot of your Pokémon GO screen to extract your userId</p>
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'user_id')} />

            {userIdPreview && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userIdPreview && (
                        <div>
                            <h3 className="font-semibold">UserId Box</h3>
                            <img src={userIdPreview} alt="UserId crop" className="border border-gray-400" />
                        </div>
                    )}
                </div>
            )}

            {!loading && userId && (
                <div className="mt-4 space-y-2">
                    <p>
                        <strong>UserId:</strong> {userId}
                    </p>
                </div>
            )}

            {/* STEP 3 */}
            <Login
                savedData={{
                    username,
                    level,
                    userId
                }}
            />
        </div>
    );
}
