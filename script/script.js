// Fetch Pokemon data from PokeAPI

const P = new Pokedex.Pokedex()

async function getPokemonData() {
	const pokemonData = await P.getPokemonsList({ limit: 100 })
	const pokemonDetails = await Promise.all(
		pokemonData.results.map((pokemon) => P.getPokemonByName(pokemon.name))
	)
	const data = pokemonDetails.map((pokemon) => ({
		name: pokemon.name,
		height: pokemon.height,
	}))
	return data
}

// Function to create bar chart

function createBarChart(data) {
	console.log('in function')
	const svgWidth = 600
	const svgHeight = 400
	const margin = { top: 20, right: 20, bottom: 30, left: 50 }
	const width = svgWidth - margin.left - margin.right
	const height = svgHeight - margin.top - margin.bottom

	const svg = d3
		.select('#bar-chart')
		.append('svg')
		.attr('width', svgWidth)
		.attr('height', svgHeight)
		.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`)

	const x = d3
		.scaleBand()
		.range([0, width])
		.domain(data.map((d) => d.name))
		.padding(0.1)

	const y = d3
		.scaleLinear()
		.range([height, 0])
		.domain([0, d3.max(data, (d) => d.height)])

	svg
		.append('g')
		.attr('transform', `translate(0,${height})`)
		.call(d3.axisBottom(x))

	svg.append('g').call(d3.axisLeft(y))

	svg
		.selectAll('.bar')
		.data(data)
		.enter()
		.append('rect')
		.attr('class', 'bar')
		.attr('x', (d) => x(d.name))
		.attr('y', (d) => y(Number.isNaN(d.height) ? defaultHeight : d.height))
		.attr('width', x.bandwidth())
		.attr('height', (d) => (Number.isNaN(d.height) ? 0 : height - y(d.height)))
		.on('mouseover', function (d) {
			d3.select(this).style('fill', 'orange')
		})
		.on('mouseout', function (d) {
			d3.select(this).style('fill', 'black')
		})
		.on('click', function (d) {})
}

// Main function to fetch data and create visualization
async function main() {
	try {
		const pokemonData = await getPokemonData()
		console.log({ pokemonData })
		createBarChart(pokemonData)
	} catch (error) {
		console.error('Error fetching data:', error)
	}
}

main()
