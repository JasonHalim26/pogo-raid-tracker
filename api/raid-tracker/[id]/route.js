import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function PATCH(req, { params }) {
    const { id } = params;
    const updates = await req.json();
    const docRef = doc(db, 'raid-tracker', id);
    await updateDoc(docRef, updates);
    return NextResponse.json({ status: 'updated' });
}

export async function DELETE(_, { params }) {
    const { id } = params;
    const docRef = doc(db, 'raid-tracker', id);
    await deleteDoc(docRef);
    return NextResponse.json({ status: 'deleted' });
}
