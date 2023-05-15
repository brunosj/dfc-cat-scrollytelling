<script>
	import Axis from '$components/EmissionsChart/Axis.svelte';
	import { extent, scaleLinear, scaleTime, line, curveNatural } from 'd3';
	import { fly } from 'svelte/transition';
	// Export props
	export let datapoints;
	export let step;

	// Function to format the date number in a date object
	const reformatYear = (data) => {
		return data.map((item) => {
			const year = new Date(item.year, 0, 1);
			return { ...item, year: year };
		});
	};

	// Declare variables used in the graph
	let lineGeneratorActual = null;
	let lineGeneratorPoliciesAction = null;
	let lineGeneratorPlannedPolicies = null;

	// Deconstruct datapoints object to extract individual arrays
	const { actual, policiesAction, plannedPolicies } = datapoints;

	// Reformat dates in arrays and add actual data last value (this allows the line paths to start from this value rather than their own first value)
	const reformattedActual = reformatYear(actual);
	const lastActualData = reformattedActual[reformattedActual.length - 1];
	let reformattedPoliciesAction = [lastActualData, ...reformatYear(policiesAction)];
	let reformattedPlannedPolicies = [lastActualData, ...reformatYear(plannedPolicies)];

	// Define stylying variables
	const margin = { top: 100, bottom: 100, left: 70, right: 70 };
	let width = 900;
	let height = 700;

	const innerHeight = height - margin.top - margin.bottom,
		innerWidth = width - margin.left - margin.right;

	// Define scales

	// Merge arrays to derive full range of values
	const allData = [...actual, ...policiesAction, ...plannedPolicies];
	const allDataReformatted = reformatYear(allData);

	// Use D3 functions to define x and y scales
	$: xScale = scaleTime()
		.domain(extent(allDataReformatted, (d) => d.year))
		.range([0, innerWidth])
		.nice();

	$: yScale = scaleLinear()
		.domain(extent(allDataReformatted, (d) => d.emissions))
		.range([innerHeight, 0])
		.nice();

	// Use reactive variable to render line paths

	$: lineGeneratorActual = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(reformattedActual);

	$: lineGeneratorPoliciesAction = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(reformattedPoliciesAction);

	$: lineGeneratorPlannedPolicies = line()
		.curve(curveNatural)
		.x((d) => xScale(d.year))
		.y((d) => yScale(d.emissions))(reformattedPlannedPolicies);
</script>

<div class="chart-container">
	<svg {width} {height}>
		<g transform={`translate(${margin.left},${margin.top})`}>
			<Axis {innerHeight} {margin} scale={xScale} position="bottom" />
			<Axis {innerHeight} {margin} scale={yScale} position="left" />
			<text x={margin.left - margin.left - 50} y={margin.top - margin.top - 30}>
				Emissions excl. LULUCF (MtCO2e/year)
			</text>

			{#each reformattedActual as data, i}
				<circle cx={xScale(data.year)} cy={yScale(data.emissions)} r="3" fill="#440FDB" />
				<path d={lineGeneratorActual} fill="none" stroke="#440FDB" stroke-width="2.5" />
			{/each}
			{#each reformattedPoliciesAction as data, i}
				{#if step >= 1}
					<g out:fly={{ duration: 400, delay: i * 15 }}>
						<circle cx={xScale(data.year)} cy={yScale(data.emissions)} r="3" fill="#AA7DF4" />
						<path d={lineGeneratorPoliciesAction} fill="none" stroke="#AA7DF4" stroke-width="2.5" />
					</g>
				{/if}
			{/each}
			{#each reformattedPlannedPolicies as data, i}
				{#if step >= 2}
					<g out:fly={{ duration: 400, delay: i * 15 }}>
						<circle cx={xScale(data.year)} cy={yScale(data.emissions)} r="3" fill="#00C2D1" />
						<path
							d={lineGeneratorPlannedPolicies}
							fill="none"
							stroke="#00C2D1"
							stroke-width="2.5"
						/>
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
	path {
		fill: transparent;
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
	}
</style>
