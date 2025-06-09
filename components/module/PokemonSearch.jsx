'use client';

import { useEffect, useRef, useState } from 'react';

export default function PokemonSearch({ pokemonList, value, onChange }) {
    const [suggestions, setSuggestions] = useState([]);
    const inputRef = useRef();

    useEffect(() => {
        if (!value) {
            setSuggestions([]);
            return;
        }

        const matches = pokemonList.filter((name) => name.startsWith(value.toLowerCase())).slice(0, 5); // limit to 5 suggestions

        setSuggestions(matches);
    }, [value, pokemonList]);

    const handleKeyDown = (e) => {
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestions.length > 0) {
            e.preventDefault();
            onChange(suggestions[0]);
        }
    };

    const handleSuggestionClick = (name) => {
        onChange(name);
    };

    return (
        <div className="relative w-full sm:w-[70%] text-gray-900">
            {/* Input + ghost suggestion overlay */}
            <div className="relative">
                {/* Ghost suggestion text */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 px-4 py-2 text-lg text-gray-7 pointer-events-none select-none whitespace-pre z-10 font-mono"
                >
                    <span className="opacity-0">{value}</span>
                    <span className="absolute left-4 top-2.5">
                        {value}
                        <span className="text-gray-400">
                            {suggestions.length > 0 ? suggestions[0].slice(value.length) : ''}
                        </span>
                    </span>
                </div>

                {/* Actual input field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full border border-gray-300 rounded-lg py-2 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-transparent relative text-white"
                    placeholder="Search Pokémon"
                    spellCheck={false}
                    autoComplete="off"
                />
            </div>

            {/* Dropdown Suggestions */}
            {suggestions.length > 1 && (
                <ul className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-300 rounded-b-lg shadow-lg z-20 overflow-hidden">
                    {suggestions.map((name) => (
                        <li
                            key={name}
                            onClick={() => handleSuggestionClick(name)}
                            className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-gray-800"
                            onMouseDown={(e) => e.preventDefault()} // prevents blur
                        >
                            {name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
