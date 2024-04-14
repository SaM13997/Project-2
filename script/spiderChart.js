const chartContainer = document.getElementById('chart')
const pokemonSelect = document.getElementById('pokemon')

const P = new Pokedex.Pokedex()
const client = new Pokeapi()

function populateDropdown() {
	client.getPokemonList().then((data) => {
		data.results.forEach((pokemon) => {
			const option = document.createElement('option')
			option.value = pokemon.name
			option.textContent = pokemon.name
			pokemonSelect.appendChild(option)
		})
	})
}

function drawChart(pokemonName) {
	client.getPokemon(pokemonName).then((data) => {
		const stats = data.stats.map((stat) => stat.base_stat)
		const statNames = data.stats.map((stat) => stat.stat.name)

		const width = chartContainer.clientWidth
		const height = chartContainer.clientHeight

		const margin = 20
		const radius = Math.min(width, height) / 2 - margin
		const numSpokes = stats.length
		const angleSlice = (Math.PI * 2) / numSpokes

		const svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', width)
			.attr('height', height)

		const g = svg
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 2})`)

		const scale = d3
			.scaleLinear()
			.domain([0, Math.max(...stats)])
			.range([0, radius])

		const axis = d3
			.scaleBand()
			.domain(statNames)
			.range([0, Math.PI * 2])

		const radialLine = d3
			.lineRadial()
			.curve(d3.curveLinearClosed)
			.angle((d) => axis(d))
			.radius((d) => scale(d))

		const path = g
			.append('path')
			.datum(stats)
			.attr('d', radialLine)
			.attr('fill', 'lightblue')
			.attr('stroke', 'black')
			.attr('stroke-width', 2)

		const axisLabels = g
			.selectAll('.axis-label')
			.data(statNames)
			.enter()
			.append('text')
			.attr('text-anchor', (d, i) =>
				(i + 0.5) * angleSlice > Math.PI ? 'end' : 'start'
			)
			.attr(
				'transform',
				(d) =>
					`rotate(${(axis(d) * 180) / Math.PI}) translate(${radius + 10},0)`
			)
			.text((d) => d)
	})
}

populateDropdown()

// Event listener for dropdown change
pokemonSelect.addEventListener('change', function () {
	const selectedPokemon = this.value
	drawChart(selectedPokemon)
})
