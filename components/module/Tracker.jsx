'use client';

import { useEffect, useState } from 'react';
import LoadingPopup from './LoadingPopup';
import PokemonSearch from './PokemonSearch';
// import getAllPokemonNames from '../api/utils';

export default function ShinyTracker() {
    const maxPity = 20;
    const [loading, setLoading] = useState(true);
    const [newPokemonName, setNewPokemonName] = useState('');
    const [allTrackers, setAllTrackers] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchTrackers();
    }, []);

    const fetchTrackers = async () => {
        try {
            const res = await fetch('/api/raid-tracker');
            const data = await res.json();
            if (data.trackers) {
                const sortedTrackers = data.trackers.sort((a, b) => {
                    const aSec = a.updatedAt?._seconds || 0;
                    const aNano = a.updatedAt?._nanoseconds || 0;
                    const bSec = b.updatedAt?._seconds || 0;
                    const bNano = b.updatedAt?._nanoseconds || 0;

                    // Compare seconds first, then nanoseconds if tie
                    if (bSec !== aSec) {
                        return bSec - aSec;
                    }
                    return bNano - aNano;
                });

                setAllTrackers(sortedTrackers);
            }
        } catch (e) {
            console.error('Error fetching trackers:', e);
        } finally {
            setLoading(false);
        }
    };

    const saveTracker = async (updatedRaids, shinyStatus, name) => {
        try {
            setActionLoading(true);
            await fetch('/api/raid-tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ totalRaids: updatedRaids, gotShiny: shinyStatus, pokemonName: name })
            });

            await fetchTrackers();
            setActionLoading(false);
        } catch (e) {
            console.error('Error saving tracker:', e);
        }
    };

    const createPokemon = async () => {
        if (!newPokemonName.trim()) return;

        // Check for duplicate (case-insensitive)
        const exists = allTrackers.some(
            (tracker) => tracker.pokemonName.toLowerCase() === newPokemonName.trim().toLowerCase()
        );

        if (exists) {
            setErrorMessage('This Pokémon is already being tracked.');
            return;
        }

        setErrorMessage('');
        setActionLoading(true);
        await saveTracker(0, false, newPokemonName.trim());
        setActionLoading(false);
        setNewPokemonName('');
    };

    const deleteTracker = async (pokemonName) => {
        try {
            setActionLoading(true);

            const res = await fetch('/api/raid-tracker', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pokemonName })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete tracker');
            }

            // Refresh trackers after delete
            await fetchTrackers();
            setActionLoading(false);
        } catch (error) {
            console.error('Delete error:', error.message);
            alert(`Error deleting tracker: ${error.message}`);
        }
    };

    const [pokemonList, setPokemonList] = useState([]);

    async function getAllPokemonNames() {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
        const data = await res.json();
        return data.results.map((p) => p.name);
    }

    useEffect(() => {
        getAllPokemonNames().then(setPokemonList);
    }, []);

    if (loading) return <div className="text-white text-center p-6">Loading...</div>;

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-start p-6 space-y-6">
            {actionLoading && <LoadingPopup />}

            <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
                <h1 className="text-2xl font-bold text-center text-blue-400">Shiny Tracker</h1>

                {errorMessage && <p className="text-red-400 text-sm text-center">{errorMessage}</p>}

                <div className="flex gap-2 items-center flex-wrap w-full">
                    {/* <input
                        type="text"
                        placeholder="Enter Pokémon name"
                        value={newPokemonName}
                        onChange={(e) => setNewPokemonName(e.target.value)}
                        className="flex-1 p-2 rounded bg-gray-700 text-white max-w-full sm:max-w-[80%]"
                    /> */}

                    <PokemonSearch pokemonList={pokemonList} value={newPokemonName} onChange={setNewPokemonName} />

                    <button
                        onClick={createPokemon}
                        className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-500 w-full sm:w-auto"
                    >
                        Add Pokémon
                    </button>
                </div>
            </div>

            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTrackers.map((tracker, idx) => {
                    const progress = Math.min((tracker.totalRaids / maxPity) * 100, 100);
                    const left = Math.max(maxPity - tracker.totalRaids, 0);

                    const addRaid = () => saveTracker(tracker.totalRaids + 1, tracker.gotShiny, tracker.pokemonName);
                    const rmvRaid = () => saveTracker(tracker.totalRaids - 1, tracker.gotShiny, tracker.pokemonName);
                    const markShiny = () => saveTracker(tracker.totalRaids, true, tracker.pokemonName);
                    const resetAll = () => saveTracker(0, false, tracker.pokemonName);

                    return (
                        <div key={idx} className="w-full bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-center text-blue-400 capitalize">
                                {tracker.pokemonName} Shiny Tracker
                            </h2>

                            <div className="flex justify-between items-center">
                                <span>Total Raids:</span>
                                <span className="font-bold">{tracker.totalRaids}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span>Shiny Found:</span>
                                <span className="text-yellow-300">{tracker.gotShiny ? '✅' : '❌'}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span>Remaining to Pity:</span>
                                <span className="text-pink-400">{left}</span>
                            </div>

                            <div className="w-full bg-gray-700 h-4 rounded">
                                <div
                                    className={`h-4 rounded transition-all duration-300 ${
                                        tracker.totalRaids >= maxPity ? 'bg-pink-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="flex justify-between mt-4 gap-4 flex-col">
                                <div className="flex gap-2 items-center w-full">
                                    <button
                                        onClick={markShiny}
                                        className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400 w-full"
                                    >
                                        🌟 Shiny
                                    </button>
                                    <button onClick={rmvRaid} className="bg-red-600 px-4 py-2 rounded hover:bg-red-500">
                                        - {/* - Decrease Raid */}
                                    </button>
                                    <button
                                        onClick={addRaid}
                                        className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
                                    >
                                        +{/* + Increase Raid */}
                                    </button>
                                </div>

                                <div className="flex gap-2 items-center">
                                    <button
                                        onDoubleClick={() => deleteTracker(tracker.pokemonName)}
                                        className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500 text-white"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={resetAll}
                                        className="bg-red-600 px-4 py-2 w-full rounded hover:bg-red-500"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-center text-gray-400 mt-2">
                                Pity activates at 20 raids, shiny guaranteed by 21.
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
