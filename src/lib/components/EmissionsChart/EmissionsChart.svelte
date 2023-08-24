<script>
	import Axis from '$components/EmissionsChart/Axis.svelte';
	// *** Give min/max an alias so they don't clash with fn from Math library
	import { extent, scaleLinear, scaleTime, scaleOrdinal, line, curveNatural, area, group, min as d3min, max as d3max, timeParse, symbol, symbolCircle, select as d3select} from 'd3';
	import { construct_svelte_component } from 'svelte/internal';
	import { fly } from 'svelte/transition';

	// Export props

	export let datapoints;
	export let fairsharedata;
	export let step;

	// Define styling variables

	const margin = { top: 100, bottom: 100, left: 70, right: 70 };
	let width = 700;
	let height = 600;

	const innerHeight = height - margin.top - margin.bottom,
		innerWidth = width - margin.left - margin.right;

	// Define util functions
	// *** d3 timeParse fn doesn't require as to give arbitrary day/month vals
	const parseDate = timeParse("%Y")

	// *** format the date number in a date object
	const reformatYear = (data) => {
		return data.map((item) => {
			return { ...item, yeardate: parseDate(item.year) };
		});
	};

	// Declare variables used in the graph

	//*** FAIRSHARE DATA FOR STACKED BARS ***//
	// Read fairshare data into array
	const {
		fairshare: fairshare,
	} = fairsharedata;

	var fairshareArray = reformatYear(fairshare)

	// *** Group data bytemperature category
	var dataFairShareGrouped = group(fairshareArray, d => d.temp)
	// *** Convert this d3 'group' object into an array (needed for us to use below)
	var arrayFairShareGrouped = Array.from(dataFairShareGrouped)

	console.log(arrayFairShareGrouped)

	//*** DATA FOR EMISSIONS PATHWAYS ***//
	// *** deconstruct datapoints object to extract individual arrays
	const {
		actual: actualUnformatted,
		future: futureUnformatted
	} = datapoints;

	// *** reformat dates in arrays and add actual data last value
	// *** (this allows the line paths to start from this value rather than their own first value)
	const actual = reformatYear(actualUnformatted);
	const future = reformatYear(futureUnformatted);

	// *** Merge historical and future data together into one array
	const mergedArray = [
		...actual,
		...future
	]

	// *** Make this into a single dataset
	// *** Need this to e.g. determine extent of all data
	const data = mergedArray.map((d) => ({
		// Keep year as both number and date for convenience
		year: d.year,
		yeardate: d.yeardate,
		ymin: d.ymin,
		ymax: d.ymax
	}));

	// *** Group our future data by temperature category
	var dataFutureGrouped = group(future, d => d.temp)
	// *** Convert this d3 'group' object into an array (needed for us to use below)
	var arrayFutureGrouped = Array.from(dataFutureGrouped)

	// *** Create funcs that returns colours for a key
	// *** We make a different colour scale for area and lines (because top and bottom area don't have a bouding line)
	const colourScaleLine = scaleOrdinal()
		.domain(dataFutureGrouped.keys())
		.range(['transparent', '#DF7153', '#E8AF5B', '#F0E478', '#B5CA74']);

	const colourScaleArea = scaleOrdinal()
		.domain(dataFutureGrouped.keys())
		.range(['#FFF', '#DF7153', '#E8AF5B', '#F0E478', '#B5CA74']);

	// Use D3 functions to define x and y scales
	const xScale = scaleTime()
		.domain(extent(data, (d) => d.yeardate))
		.range([0, innerWidth*0.65]) // Reduce range of the axis so there is 25% of space not used
		.nice();

	// *** Because we now split our data between ymin/ymax we can't use extent and need to use min/max across the two variables
	const yScale = scaleLinear()
		.domain([d3min(data, (d) => d.ymin), d3max(data, (d) => d.ymax)])
		.range([innerHeight, 0])
		.nice();

	// Build functions to generate d3 lines or areas
	$: lineFn = line()
		.curve(curveNatural)
		.x((d) => xScale(d.yeardate))
		.y((d) => yScale(d.ymax));

	$: areaFn = area()
		.curve(curveNatural)
		.x((d) => xScale(d.yeardate))
		.y0((d) => yScale(d.ymin))
		.y1((d) => yScale(d.ymax));

</script>

<div class="chart-container">
	<svg {width} {height}>
		<g transform={`translate(${margin.left},${margin.top})`}>
			<Axis {innerHeight} {margin} scale={xScale} position="bottom" />
			<Axis {innerHeight} {margin} scale={yScale} position="left" />
			<text x={margin.left - margin.left - 50} y={margin.top - margin.top - 30}>
				Emissions excl. LULUCF (MtCO2e/year)
			</text>

			// Historical data graph
			<path d={lineFn(actual)} fill="none" stroke="#440FDB" stroke-width="2.5"/>

			// Example of policies and actions point and boxes
			<circle cx={xScale(parseDate(2030))} cy={yScale(550)} r=7 fill="#508eb5"></circle>
			<path d={lineFn([{yeardate: parseDate(2030), ymax: 550},
							 {yeardate: parseDate(2040), ymax: 550}])} stroke="#508eb5" stroke-width="2"></path>
			<path d={lineFn([{yeardate: parseDate(2040), ymax: 550},
							 {yeardate: parseDate(2040), ymax: 1040}])} stroke="#508eb5" stroke-width="2"></path>
			<path d={areaFn([{yeardate: parseDate(2032), ymin: 1050, ymax: 1200},
							 {yeardate: parseDate(2047), ymin: 1050, ymax: 1200}])} fill = "#508eb5" stroke="black" stroke-width="5"></path>
			<path d={areaFn([{yeardate: parseDate(2032), ymin: 1200, ymax: 1300},
							 {yeardate: parseDate(2047), ymin: 1200, ymax: 1300}])} fill = "#508eb5" stroke="black" stroke-width="5"></path>

			// Example of stacked bar plot
			{#each arrayFairShareGrouped as [key, dataArray], i}
				<path d={areaFn(dataArray)} fill={colourScaleArea(key)} opacity=0.4></path>
			{/each}

			// Grouped data
			// Looping over our grouped array gives us subset data for each temp category
			{#each arrayFutureGrouped as [key, dataArray], i}
				{#if step >= i + 1}
					<g
						out:fly={{ duration: 400, delay: i * 15 }}
						in:fly={{ duration: 1000, y: 200, opacity: 0 }}
					>

						<path d={lineFn(dataArray)} fill="none" stroke={colourScaleLine(key)} stroke-width="4"></path>
						<path d={areaFn(dataArray)} fill={colourScaleArea(key)} opacity=0.2></path>

					</g>
				{/if}
			{/each}

			<text x={innerWidth / 2} y={innerHeight + 55}>Year</text>
		</g>
	</svg>
</div>

<style>
	text {
		fill: white;
	}
	/* path {
		stroke-width: 2.5;
		stroke-linejoin: round;
		stroke-dasharray: 4400;
		stroke-dashoffset: 0;
		animation: draw 8.5s ease;
	}

	@keyframes draw {
		from {
			stroke-dashoffset: 4400;
		}
		to {
			stroke-dashoffset: 0;
		}
	} */
</style>
