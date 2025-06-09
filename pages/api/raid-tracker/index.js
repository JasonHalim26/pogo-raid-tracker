import admin from 'firebase-admin';
import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs } from 'firebase/firestore';

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const trackersCollection = db.collection('raidTrackers');

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        try {
            const { userId, pokemonName } = req.body;

            if (!userId || !pokemonName) {
                return res.status(400).json({ error: 'Missing userId or pokemonName' });
            }

            const userCardsRef = db.collection('users').doc(userId).collection('pokemonCards');

            // Find the document with the given pokemonName
            const snapshot = await userCardsRef
                .where('pokemonName', '==', pokemonName.trim().toLowerCase())
                .limit(1)
                .get();

            if (snapshot.empty) {
                return res.status(404).json({ error: `No tracker found for ${pokemonName}` });
            }

            // Delete the found document
            const docRef = snapshot.docs[0].ref;
            await docRef.delete();

            return res.status(200).json({ message: `Tracker for ${pokemonName} deleted.` });
        } catch (e) {
            console.error('Error deleting tracker:', e);
            return res.status(500).json({ error: 'Failed to delete tracker' });
        }
    } else if (req.method === 'POST') {
        try {
            const { userId, pokemonName, totalRaids = 0, gotShiny = false } = req.body;

            //             users/
            //   └── userId123/
            //       └── pokemonCards/
            //           ├── autoGenDocId1 { pokemonName: 'uxie', totalRaids: 12, gotShiny: false }
            //           ├── autoGenDocId2 { pokemonName: 'mesprit', totalRaids: 5, gotShiny: true }

            if (!userId || !pokemonName) {
                return res.status(400).json({ error: 'Missing userId or pokemonName' });
            }

            const userCardsRef = db.collection('users').doc(userId).collection('pokemonCards');

            // Add a new tracker entry for this user
            const docRef = await userCardsRef.add({
                userId,
                pokemonName,
                totalRaids,
                gotShiny,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return res.status(200).json({ id: docRef.id, message: `Tracker for ${pokemonName} saved.` });
        } catch (e) {
            console.error('Error saving user tracker:', e);
            return res.status(500).json({ error: 'Failed to save tracker' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { userId, pokemonName, totalRaids = 0, gotShiny = false } = req.body;

            if (!userId || !pokemonName) {
                return res.status(400).json({ error: 'Missing userId or pokemonName' });
            }

            console.log('🔥 Updating existing tracker...');

            const userCardsRef = db.collection('users').doc(userId).collection('pokemonCards');

            // Search for existing document with same pokemonName
            const existingSnapshot = await userCardsRef
                .where('pokemonName', '==', pokemonName.toLowerCase())
                .limit(1)
                .get();

            let docRef;
            const data = {
                pokemonName: pokemonName.toLowerCase(),
                totalRaids,
                gotShiny,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            if (!existingSnapshot.empty) {
                // If document exists, update it
                docRef = existingSnapshot.docs[0].ref;
                await docRef.update(data);
            } else {
                // Else, create a new one
                docRef = await userCardsRef.add(data);
            }

            return res.status(200).json({
                id: docRef.id,
                message: `Tracker for ${pokemonName} saved.`
            });
        } catch (e) {
            console.error('Error saving user tracker:', e);
            return res.status(500).json({ error: 'Failed to save tracker' });
        }
    } else if (req.method === 'GET') {
        try {
            const userId = req.query.userId;
            console.log('🔥 Getting all pokemonCards for userId:', userId);

            if (!userId) {
                return res.status(400).json({ error: 'Missing userId in query' });
            }

            const snapshot = await db.collectionGroup('pokemonCards').where('userId', '==', userId).get();

            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            return res.status(200).json(data);
        } catch (err) {
            console.error('[GET pokemonCards] Error:', err);
            return res.status(500).json({ error: 'Server error' });
        }
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
