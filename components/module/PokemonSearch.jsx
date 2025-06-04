'use client';

import { useEffect, useRef, useState } from 'react';

export default function PokemonSearch({ pokemonList, value, onChange }) {
    const [suggestion, setSuggestion] = useState('');
    const inputRef = useRef();

    useEffect(() => {
        if (!value) {
            setSuggestion('');
            return;
        }

        const match = pokemonList.find((name) => name.startsWith(value.toLowerCase()));
        setSuggestion(match && match !== value.toLowerCase() ? match : '');
    }, [value, pokemonList]);

    return (
        <div className="bg-white" style={{ position: 'relative', width: '300px' }}>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    width: '100%',
                    fontSize: '18px',
                    padding: '8px',
                    zIndex: 2
                }}
                spellCheck={false}
                autoComplete="off"
            />
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    pointerEvents: 'none',
                    color: 'black',
                    fontSize: '18px',
                    fontFamily: 'inherit',
                    userSelect: 'none',
                    zIndex: 1,
                    whiteSpace: 'pre'
                }}
            >
                {value}
                <span style={{ color: 'lightgray' }}>{suggestion?.slice(value.length)}</span>
            </div>
        </div>
    );
}
