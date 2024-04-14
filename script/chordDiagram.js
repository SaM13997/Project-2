// Initialize PokeAPI
let Pokedex

// Check if Pokedex is defined before initializing
if (typeof Pokedex === 'undefined') {
	console.log(
		'Pokedex is not defined. Make sure you have included the necessary library.'
	)
} else {
	Pokedex = new Pokedex.Pokedex()
}
console.log('Pokedex', Pokedex)
// Define colors for the chords
const colorScale = d3.scaleOrdinal(d3.schemePastel10)

// Set dimensions and margins for the chart
const width = 600
const height = 600
const margin = { top: 20, right: 20, bottom: 20, left: 20 }

// Create SVG element
const svg = d3
	.select('#chart-container')
	.append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', `translate(${margin.left},${margin.top})`)

// Fetch Pokemon data from PokeAPI
async function fetchData() {
	const pokemonList = await Pokedex.getPokemonSpeciesList()
	const pokemonNames = pokemonList.results.map((pokemon) => pokemon.name)
	const pokemonData = await Promise.all(
		pokemonNames.map((name) => Pokedex.getPokemonSpeciesByName(name))
	)

	const matrix = []
	pokemonData.forEach((pokemon, index) => {
		const row = Array(pokemonData.length).fill(0)
		pokemon.pokedex_numbers.forEach((entry) => {
			const targetIndex = pokemonNames.indexOf(entry.pokemon.name)
			if (targetIndex !== -1) {
				row[targetIndex] = 1
			}
		})
		matrix.push(row)
	})

	return { names: pokemonNames, matrix }
}

// Function to create chord diagram
async function createChordDiagram() {
	const data = await fetchData()

	// Create chord layout
	const chord = d3
		.chord()
		.padAngle(0.05)
		.sortSubgroups(d3.descending)
		.sortChords(d3.ascending)

	const chords = chord(data.matrix)

	// Add arcs for each Pokemon
	const arc = d3
		.arc()
		.innerRadius(width / 2 - 100)
		.outerRadius(width / 2 - 80)

	svg
		.append('g')
		.selectAll('path')
		.data(chords.groups)
		.enter()
		.append('path')
		.attr('fill', (d) => colorScale(d.index))
		.attr('d', arc)
		.append('title')
		.text((d) => data.names[d.index])

	// Add ribbons for interactions between Pokemon
	const ribbon = d3.ribbon().radius(width / 2 - 80)

	svg
		.append('g')
		.attr('fill-opacity', 0.67)
		.selectAll('path')
		.data(chords)
		.enter()
		.append('path')
		.attr('fill', (d) => colorScale(d.target.index))
		.attr('d', ribbon)
		.append('title')
		.text(
			(d) =>
				`${data.names[d.target.index]} → ${data.names[d.source.index]}: ${
					d.source.value
				}`
		)

	// Add entry animations
	svg
		.selectAll('path')
		.attr('opacity', 0)
		.transition()
		.duration(1000)
		.delay((d, i) => i * 20)
		.attr('opacity', 1)
}

// Call function to create chord diagram
createChordDiagram()
