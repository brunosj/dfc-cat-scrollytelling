<script>
	import Scrolly from '../components/Scrolly.svelte';
	import EmissionsChart from '../components/EmissionsChart/EmissionsChart.svelte';
	import GermanyData from '../data/GermanyEmissions.js';

	let value;
	const steps = [
		'<p>This graph illustrates the emission trends in Germany since 1990. While there has been a consistent decline in emissions, it is worth noting that Germany remains a significant contributor to overall emissions.</p>',
		'<p>We project that implemented policies and actions will lead to emissions reductions of between 49% - 51% below 1990 levels by 2030 excl. LULUCF.</p>',
		'<p>If all measures planned in the coalition contract were implemented, Germany would get close to its domestic emissions target of a <span class="step-2">65% reduction below 1990 levels in 2030</span>.<br><br>The data can be downloaded <a href="https://climateactiontracker.org/documents/1113/202206_CAT_AssessmentData_DEU.xlsx">here</a></p>'
	];

	let show = false;
</script>

<section>
	<div class="section-container">
		<div class="steps-container">
			<Scrolly bind:value>
				{#each steps as text, i}
					<div class="step" class:active={value === i}>
						<div class="step-content">{@html text}</div>
					</div>
				{/each}
				<div class="spacer" />
			</Scrolly>
		</div>
		<div class="sticky">
			<EmissionsChart datapoints={GermanyData} step={value} />
		</div>
	</div>
</section>

<style>
	:global(body) {
		overflow-x: hidden;
		font-family: monospace;
	}

	:global(.chart) {
		width: 100%;
		min-width: 600px;
		max-width: 1200px;
	}

	:global(.step-0) {
		color: #440fdb;
		fill: #440fdb;
	}

	:global(.step-1) {
		color: #aa7df4;
		fill: #aa7df4;
	}
	:global(.step-2) {
		color: #eee5fd;
		fill: #eee5fd;
	}

	.spacer {
		height: 40vh;
	}

	.sticky {
		position: sticky;
		top: 10%;
		flex: 1 1 60%;
		width: 60%;
	}

	.section-container {
		margin-top: 1em;
		text-align: center;
		transition: background 100ms;
		display: flex;
	}

	.step {
		height: 80vh;
		display: flex;
		place-items: center;
		justify-content: center;
	}

	.step-content {
		font-size: 1rem;
		/* background: whitesmoke; */
		color: #6b6b6b;
		border-radius: 5px;
		padding: 0.5rem 1rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		transition: background 500ms ease;
		box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.2);
		text-align: left;
		width: 75%;
		margin: auto;
		max-width: 500px;
		border-radius: 0.5rem;
	}

	.step.active .step-content {
		background: #2c2c2c;
		color: white;
	}

	.steps-container,
	.sticky {
		height: 100%;
	}

	.steps-container {
		flex: 1 1 40%;
		z-index: 10;
	}

	/* Comment out the following line to always make it 'text-on-top' */
	@media screen and (max-width: 768px) {
		.section-container {
			flex-direction: column-reverse;
		}
		.sticky {
			width: 95%;
			margin: auto;
		}
	}
</style>
