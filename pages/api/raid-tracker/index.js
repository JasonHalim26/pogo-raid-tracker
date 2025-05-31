import admin from 'firebase-admin';

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
            const { pokemonName } = req.body;

            if (!pokemonName) {
                return res.status(400).json({ error: 'Missing pokemonName' });
            }

            const docId = pokemonName.trim().toLowerCase();
            await trackersCollection.doc(docId).delete();

            return res.status(200).json({ message: `Tracker for ${pokemonName} deleted.` });
        } catch (e) {
            console.error('Error deleting tracker:', e);
            return res.status(500).json({ error: 'Failed to delete tracker' });
        }
    } else if (req.method === 'POST') {
        try {
            const { totalRaids = 0, gotShiny = false, pokemonName = 'Unknown' } = req.body;

            if (!pokemonName) {
                return res.status(400).json({ error: 'Missing pokemonName' });
            }

            const docId = pokemonName.trim().toLowerCase();
            await trackersCollection.doc(docId).set({
                totalRaids,
                gotShiny,
                pokemonName,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return res.status(200).json({ message: `Tracker for ${pokemonName} saved.` });
        } catch (e) {
            console.error('Error saving tracker:', e);
            return res.status(500).json({ error: 'Failed to save tracker' });
        }
    } else if (req.method === 'GET') {
        try {
            const snapshot = await trackersCollection.get();
            const trackers = snapshot.docs.map((doc) => doc.data());
            return res.status(200).json({ trackers });
        } catch (e) {
            console.error('Error fetching trackers:', e);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
