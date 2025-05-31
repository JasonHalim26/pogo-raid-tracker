import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const trackerRef = collection(db, 'raid-tracker');

export async function GET() {
    const snapshot = await getDocs(trackerRef);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(data);
}

export async function POST(req) {
    const body = await req.json();
    const docRef = await addDoc(trackerRef, {
        name: body.name,
        totalRaids: 0,
        gotShiny: false
    });
    return NextResponse.json({ id: docRef.id });
}
