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

	// *** derive the originYValue so that the areas can fill the entire space from the origin and not the min value of the dataset (previous iteration of the chart)
	function getY0Value() {
		const minYValue = yScale.domain()[0];
		const originYValue = yScale(minYValue);
		return originYValue;
	}

	// Declare variables used in the graph

	// *** line paths
	let lineActual = null;
	let lineAboveFourDegrees = null;
	let lineFourDegrees = null;
	let lineThreeDegrees = null;
	let lineTwoDegrees = null;
	let lineOnePointFiveDegrees = null;
	let lineBottomRange = null;

	// *** areas
	let areaAboveFourDegrees = null;
	let areaFourDegrees = null;
	let areaThreeDegrees = null;
	let areaTwoDegrees = null;
	let areaOnePointFiveDegrees = null;
	let areaBottomRange = null;

	// Arrange data

	// *** deconstruct datapoints object to extract individual arrays
	const {
		actual: actualUnformatted,
		aboveFourDegrees: aboveFourDegreesUnformatted,
		fourDegrees: fourDegreesUnformatted,
		threeDegrees: threeDegreesUnformatted,
		twoDegrees: twoDegreeUnformatted,
		onePointFiveDegrees: onePointFiveDegreesUnformatted,
		bottomRange: bottomRangeUnformatted
	} = datapoints;

	// *** reformat dates in arrays and add actual data last value
	// *** (this allows the line paths to start from this value rather than their own first value)
	const actual = reformatYear(actualUnformatted);
	const lastActualData = actual[actual.length - 1];

	const arraysToReformat = [
		{ name: 'aboveFourDegrees', data: aboveFourDegreesUnformatted },
		{ name: 'fourDegrees', data: fourDegreesUnformatted },
		{ name: 'threeDegrees', data: threeDegreesUnformatted },
		{ name: 'twoDegrees', data: twoDegreeUnformatted },
		{ name: 'onePointFiveDegrees', data: onePointFiveDegreesUnformatted },
		{ name: 'bottomRange', data: bottomRangeUnformatted }
	];

	const arrays = {};
	for (const arrayObj of arraysToReformat) {
		const reformattedArray = [lastActualData, ...reformatYear(arrayObj.data)];
		arrays[`${arrayObj.name}`] = reformattedArray;
	}

	console.log('above', typeof arrays.aboveFourDegrees);
	console.log('four', typeof arrays.fourDegrees);
	// *** merge arrays to derive full range of values
	const mergedArray = [
		...actual,
		...arrays.aboveFourDegrees,
		...arrays.fourDegrees,
		...arrays.threeDegrees,
		...arrays.twoDegrees,
		...arrays.onePointFiveDegrees,
		...arrays.bottomRange
	];

	const data = mergedArray.map((d) => ({
		year: d.year,
		emissions: d.emissions,
		emissionsMin: d.emissionMin
	}));

	// Use D3 functions to define x and y scales
	const xScale = scaleTime()
		.domain(extent(data, (d) => d.year))
		.range([0, innerWidth])
		.nice();

	const yScale = scaleLinear()
		.domain(extent(data, (d) => d.emissions))
		.range([innerHeight, 0])
		.nice();
	// Use reactive variables to render line paths and areas

	// *** line paths
	$: lineActual = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(actual);

	$: lineAboveFourDegrees = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(arrays.aboveFourDegrees);

	$: lineFourDegrees = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(arrays.fourDegrees);

	$: lineThreeDegrees = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(arrays.threeDegrees);

	$: lineTwoDegrees = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(arrays.twoDegrees);

	$: lineOnePointFiveDegrees = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(arrays.onePointFiveDegrees);

	$: lineBottomRange = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(arrays.bottomRange);

	// *** areas
	$: areaAboveFourDegrees = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y0((d, i) => {
			if (i === 0) {
				return yScale(lastActualData.emissions);
			} else {
				const previousData = arrays.fourDegrees[i];
				return yScale(previousData.emissions);
			}
		})
		.y1((d) => yScale(d.emissions))(arrays.aboveFourDegrees);

	$: areaFourDegrees = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		// .y0(() => getY0Value())
		//this was previously used to show "cumulative" emissions
		.y0((d, i) => {
			if (i === 0) {
				return yScale(lastActualData.emissions);
			} else {
				const previousData = arrays.threeDegrees[i];
				return yScale(previousData.emissions);
			}
		})
		.y1((d) => yScale(d.emissions))(arrays.fourDegrees);

	$: areaThreeDegrees = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		// .y0(() => getY0Value())
		.y0((d, i) => {
			if (i === 0) {
				return yScale(lastActualData.emissions);
			} else {
				const previousData = arrays.twoDegrees[i];
				return yScale(previousData.emissions);
			}
		})
		.y1((d) => yScale(d.emissions))(arrays.threeDegrees);

	$: areaTwoDegrees = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		// .y0(() => getY0Value())
		.y0((d, i) => {
			if (i === 0) {
				return yScale(lastActualData.emissions);
			} else {
				const previousData = arrays.onePointFiveDegrees[i];
				return yScale(previousData.emissions);
			}
		})
		.y1((d) => yScale(d.emissions))(arrays.twoDegrees);

	$: areaOnePointFiveDegrees = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		// .y0(() => getY0Value())
		.y0((d, i) => {
			if (i === 0) {
				return yScale(lastActualData.emissions);
			} else {
				const previousData = arrays.bottomRange[i];
				return yScale(previousData.emissions);
			}
		})
		.y1((d) => yScale(d.emissions))(arrays.onePointFiveDegrees);

	$: areaBottomRange = area()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		// .y0(() => getY0Value())
		.y0((d, i) => {
			if (i === 0) {
				return yScale(lastActualData.emissions);
			} else {
				const previousData = arrays.bottomRange[i];
				return yScale(previousData.emissions);
			}
		})
		.y1((d) => yScale(d.emissions))(arrays.bottomRange);
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
			{#each actual as data, i}
				<path d={lineActual} fill="none" stroke="#440FDB" stroke-width="2.5" />
			{/each}

			// Pathways graph
			{#each Object.entries(arrays) as [key, dataArray], i}
				{@const colorCodes = {
					aboveFourDegrees: '#FFF',
					fourDegrees: '#DF7153',
					threeDegrees: '#E8AF5B',
					twoDegrees: '#F0E478',
					onePointFiveDegrees: '#B5CA74',
					bottomRange: 'green'
				}}
				{@const lines = {
					aboveFourDegrees: lineAboveFourDegrees,
					fourDegrees: lineFourDegrees,
					threeDegrees: lineThreeDegrees,
					twoDegrees: lineTwoDegrees,
					onePointFiveDegrees: lineOnePointFiveDegrees,
					bottomRange: lineBottomRange
				}}

				{@const areas = {
					aboveFourDegrees: areaAboveFourDegrees,
					fourDegrees: areaFourDegrees,
					threeDegrees: areaThreeDegrees,
					twoDegrees: areaTwoDegrees,
					onePointFiveDegrees: areaOnePointFiveDegrees,
					bottomRange: areaBottomRange
				}}

				{#if step >= i + 1}
					<g
						out:fly={{ duration: 400, delay: i * 15 }}
						in:fly={{ duration: 1000, y: 200, opacity: 0 }}
					>
						{#each dataArray as data}
							<path d={lines[key]} fill="none" stroke={colorCodes[key]} stroke-width="4" />
							<path d={areas[key]} fill={colorCodes[key]} opacity="1" />
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
