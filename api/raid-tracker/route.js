import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// This gets all cards of a user, expects a query param ?userId=xxx
export async function GET(req) {
    console.log(' 🚀 ༼;´༎ຶ ۝ ༎ຶ༽ ~  (ノ ° 益 °) ノ ~ (っ◔◡◔)っ ~   ~ req:', req);
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        console.log(' 🚀 ༼;´༎ຶ ۝ ༎ຶ༽ ~  (ノ ° 益 °) ノ ~ (っ◔◡◔)っ ~   ~ userId:', userId);

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const userCardsRef = collection(db, 'users', userId, 'pokemonCards');
        console.log(' 🚀 ༼;´༎ຶ ۝ ༎ຶ༽ ~  (ノ ° 益 °) ノ ~ (っ◔◡◔)っ ~   ~ userCardsRef:', userCardsRef);
        const snapshot = await getDocs(userCardsRef);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Add a Pokémon card for a user, expects { userId, name, ... } in POST body
export async function POST(req) {
    try {
        const body = await req.json();

        if (!body.userId || !body.name) {
            return NextResponse.json({ error: 'Missing userId or name' }, { status: 400 });
        }

        const userCardsRef = collection(db, 'users', body.userId, 'pokemonCards');
        const docRef = await addDoc(userCardsRef, {
            name: body.name,
            totalRaids: 0,
            gotShiny: false,
            createdAt: new Date().toISOString()
            // you can add more fields here, like level, shiny status, etc.
        });

        return NextResponse.json({ id: docRef.id });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
