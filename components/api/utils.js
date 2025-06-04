async function getAllPokemonNames() {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
    const data = await res.json();
    return data.results.map((p) => p.name);
}
