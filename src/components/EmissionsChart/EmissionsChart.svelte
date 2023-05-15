<script>
	import Axis from './Axis.svelte';
	import { extent, scaleLinear, scaleTime, line, curveNatural } from 'd3';
	export let datapoints;
	export let step;
	let lineGeneratorActual = null;
	let lineGeneratorPoliciesAction = null;
	let lineGeneratorPlannedPolicies = null;

	const reformatYear = (data) => {
		return data.map((item) => {
			const year = new Date(item.year, 0, 1);
			return { ...item, year: year };
		});
	};

	const { actual, policiesAction, plannedPolicies } = datapoints;
	const allData = [...actual, ...policiesAction, ...plannedPolicies];
	const allDataReformatted = reformatYear(allData);
	const reformattedActual = reformatYear(actual);
	const lastActualData = reformattedActual[reformattedActual.length - 1];
	let reformattedPoliciesAction = [lastActualData, ...reformatYear(policiesAction)];
	let reformattedPlannedPolicies = [lastActualData, ...reformatYear(plannedPolicies)];

	const margin = { top: 100, bottom: 100, left: 100, right: 100 };
	let width = 900;
	let height = 600;

	const innerHeight = height - margin.top - margin.bottom,
		innerWidth = width - margin.left - margin.right;

	$: xScale = scaleTime()
		.domain(extent(allDataReformatted, (d) => d.year))
		.range([0, innerWidth])
		.nice();

	$: yScale = scaleLinear()
		.domain(extent(allDataReformatted, (d) => d.emissions))
		.range([innerHeight, 0])
		.nice();

	$: {
		lineGeneratorActual = line()
			.curve(curveNatural)
			.x((d) => xScale(d.year))
			.y((d) => yScale(d.emissions))(reformattedActual);

		lineGeneratorPoliciesAction = line()
			.curve(curveNatural)
			.x((d) => xScale(d.year))
			.y((d) => yScale(d.emissions))(reformattedPoliciesAction);

		lineGeneratorPlannedPolicies = line()
			.curve(curveNatural)
			.x((d) => xScale(d.year))
			.y((d) => yScale(d.emissions))(reformattedPlannedPolicies);
	}
</script>

<div class="chart-container">
	<svg {width} {height}>
		<g transform={`translate(${margin.left},${margin.top})`}>
			<Axis {innerHeight} {margin} scale={xScale} position="bottom" />
			<Axis {innerHeight} {margin} scale={yScale} position="left" />
			<text x={margin.left - margin.left - 50} y={margin.top - margin.top - 30}>
				Emissions excl. LULUCF
			</text>

			{#each reformattedActual as data, i}
				<circle cx={xScale(data.year)} cy={yScale(data.emissions)} r="3" fill="#440FDB" />
				<path d={lineGeneratorActual} fill="none" stroke="#440FDB" stroke-width="2.5" />
			{/each}
			{#each reformattedPoliciesAction as data, i}
				{#if step >= 1}
					<circle cx={xScale(data.year)} cy={yScale(data.emissions)} r="3" fill="#AA7DF4" />
					<path d={lineGeneratorPoliciesAction} fill="none" stroke="#AA7DF4" stroke-width="2.5" />
				{/if}
			{/each}
			{#each reformattedPlannedPolicies as data, i}
				{#if step >= 2}
					<circle cx={xScale(data.year)} cy={yScale(data.emissions)} r="3" fill="#EEE5FD" />
					<path d={lineGeneratorPlannedPolicies} fill="none" stroke="#EEE5FD" stroke-width="2.5" />
				{/if}
			{/each}

			<text x={innerWidth / 2} y={innerHeight + 45}>Year</text>
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
