<script>
	import Axis from '$components/EmissionsChart/Axis.svelte';
	import { extent, scaleLinear, scaleTime, line, curveNatural, area } from 'd3';
	import { fly } from 'svelte/transition';

	// Export props

	export let datapoints;
	export let step;

	// Define stylying variables

	const margin = { top: 100, bottom: 100, left: 70, right: 70 };
	let width = 900;
	let height = 700;

	const innerHeight = height - margin.top - margin.bottom,
		innerWidth = width - margin.left - margin.right;

	// Define util functions

	// *** format the date number in a date object
	const reformatYear = (data) => {
		return data.map((item) => {
			const year = new Date(item.year, 0, 1);
			return { ...item, year: year };
		});
	};

	// *** derive the originYValue so that the areas can fill the entire space from the origin and not the min value of the dataset
	function getY0Value() {
		const minYValue = yScale.domain()[0];
		const originYValue = yScale(minYValue);
		return originYValue;
	}

	// Declare variables used in the graph

	// *** line paths
	let lineGeneratorActual = null;
	let lineGeneratorAboveFourDegrees = null;
	let lineGeneratorFourDegrees = null;
	let lineGeneratorThreeDegrees = null;
	let lineGeneratorTwoDegrees = null;
	let lineGeneratorOnePointFiveDegrees = null;
	let lineGeneratorBottomRange = null;

	// *** areas
	let areaGeneratorAboveFourDegrees = null;
	let areaGeneratorFourDegrees = null;
	let areaGeneratorThreeDegrees = null;
	let areaGeneratorTwoDegrees = null;
	let areaGeneratorOnePointFiveDegrees = null;
	let areaGeneratorBottomRange = null;

	// Arrange data

	// *** deconstruct datapoints object to extract individual arrays
	const {
		actual,
		aboveFourDegrees,
		fourDegrees,
		threeDegrees,
		twoDegrees,
		onePointFiveDegrees,
		bottomRange
	} = datapoints;

	// *** reformat dates in arrays and add actual data last value
	// *** (this allows the line paths to start from this value rather than their own first value)
	const reformattedActual = reformatYear(actual);
	const lastActualData = reformattedActual[reformattedActual.length - 1];

	const arraysToReformat = [
		{ name: 'AboveFourDegrees', data: aboveFourDegrees },
		{ name: 'FourDegrees', data: fourDegrees },
		{ name: 'ThreeDegrees', data: threeDegrees },
		{ name: 'TwoDegrees', data: twoDegrees },
		{ name: 'OnePointFiveDegrees', data: onePointFiveDegrees },
		{ name: 'BottomRange', data: bottomRange }
	];

	const reformattedArrays = {};
	for (const arrayObj of arraysToReformat) {
		const reformattedArray = [lastActualData, ...reformatYear(arrayObj.data)];
		reformattedArrays[`reformatted${arrayObj.name}`] = reformattedArray;
	}

	// *** merge arrays to derive full range of values
	const mergedArray = [
		...reformattedActual,
		...reformattedArrays.reformattedAboveFourDegrees,
		...reformattedArrays.reformattedFourDegrees,
		...reformattedArrays.reformattedThreeDegrees,
		...reformattedArrays.reformattedTwoDegrees,
		...reformattedArrays.reformattedOnePointFiveDegrees,
		...reformattedArrays.reformattedBottomRange
	];

	const data = mergedArray.map((d) => ({
		year: d.year,
		emissions: d.emissions
	}));

	// Use D3 functions to define x and y scales
	$: xScale = scaleTime()
		.domain(extent(data, (d) => d.year))
		.range([0, innerWidth])
		.nice();

	$: yScale = scaleLinear()
		.domain(extent(data, (d) => d.emissions))
		.range([innerHeight, 0])
		.nice();

	// Use reactive variables to render line paths and areas

	// *** line paths
	$: lineGeneratorActual = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(reformattedActual);

	$: lineGeneratorAboveFourDegrees = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(reformattedArrays.reformattedAboveFourDegrees);

	$: lineGeneratorFourDegrees = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(reformattedArrays.reformattedFourDegrees);

	$: lineGeneratorThreeDegrees = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(reformattedArrays.reformattedThreeDegrees);

	$: lineGeneratorTwoDegrees = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(reformattedArrays.reformattedTwoDegrees);

	$: lineGeneratorOnePointFiveDegrees = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(reformattedArrays.reformattedOnePointFiveDegrees);

	$: lineGeneratorBottomRange = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(reformattedArrays.reformattedBottomRange);

	// *** areas
	$: areaGeneratorAboveFourDegrees = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y0(() => getY0Value())
		.y1((d) => yScale(d.emissions))(reformattedArrays.reformattedAboveFourDegrees);

	$: areaGeneratorFourDegrees = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y0(() => getY0Value())
		.y1((d) => yScale(d.emissions))(reformattedArrays.reformattedFourDegrees);

	$: areaGeneratorThreeDegrees = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y0(() => getY0Value())
		.y1((d) => yScale(d.emissions))(reformattedArrays.reformattedThreeDegrees);

	$: areaGeneratorTwoDegrees = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y0(() => getY0Value())
		.y1((d) => yScale(d.emissions))(reformattedArrays.reformattedTwoDegrees);

	$: areaGeneratorOnePointFiveDegrees = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y0(() => getY0Value())
		.y1((d) => yScale(d.emissions))(reformattedArrays.reformattedOnePointFiveDegrees);

	$: areaGeneratorBottomRange = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y0(() => getY0Value())
		.y1((d) => yScale(d.emissions))(reformattedArrays.reformattedBottomRange);
</script>

// HTML used to render the chart

<div class="chart-container">
	<svg {width} {height}>
		<g transform={`translate(${margin.left},${margin.top})`}>
			<Axis {innerHeight} {margin} scale={xScale} position="bottom" />
			<Axis {innerHeight} {margin} scale={yScale} position="left" />
			<text x={margin.left - margin.left - 50} y={margin.top - margin.top - 30}>
				Emissions excl. LULUCF (MtCO2e/year)
			</text>

			// Historical data graph
			{#each reformattedActual as data, i}
				<path d={lineGeneratorActual} fill="none" stroke="#440FDB" stroke-width="2.5" />
			{/each}

			// Pathways graph
			{#each Object.entries(reformattedArrays) as [key, dataArray], i}
				{@const colorCodes = {
					reformattedAboveFourDegrees: '#FFF',
					reformattedFourDegrees: '#DF7153',
					reformattedThreeDegrees: '#E8AF5B',
					reformattedTwoDegrees: '#F0E478',
					reformattedOnePointFiveDegrees: '#B5CA74',
					reformattedBottomRange: 'green'
				}}
				{@const lineGenerators = {
					reformattedAboveFourDegrees: lineGeneratorAboveFourDegrees,
					reformattedFourDegrees: lineGeneratorFourDegrees,
					reformattedThreeDegrees: lineGeneratorThreeDegrees,
					reformattedTwoDegrees: lineGeneratorTwoDegrees,
					reformattedOnePointFiveDegrees: lineGeneratorOnePointFiveDegrees,
					reformattedBottomRange: lineGeneratorBottomRange
				}}

				{@const areaGenerators = {
					reformattedAboveFourDegrees: areaGeneratorAboveFourDegrees,
					reformattedFourDegrees: areaGeneratorFourDegrees,
					reformattedThreeDegrees: areaGeneratorThreeDegrees,
					reformattedTwoDegrees: areaGeneratorTwoDegrees,
					reformattedOnePointFiveDegrees: areaGeneratorOnePointFiveDegrees,
					reformattedBottomRange: areaGeneratorBottomRange
				}}

				{#if step >= i + 1}
					<g
						out:fly={{ duration: 400, delay: i * 15 }}
						in:fly={{ duration: 1000, y: 200, opacity: 0 }}
					>
						{#each dataArray as data}
							<path
								d={lineGenerators[key]}
								fill="none"
								stroke={colorCodes[key]}
								stroke-width="2.5"
							/>
							<path d={areaGenerators[key]} fill={colorCodes[key]} />
						{/each}
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
