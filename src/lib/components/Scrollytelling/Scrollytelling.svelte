<script>
	import Scrolly from '$components/Scrollytelling/ScrollyComponent.svelte';
	import EmissionsChart from '$components/EmissionsChart/EmissionsChart.svelte';
	import GermanyData from '$data/GermanyEmissionsPathways.js';
	import GermanyFairShare from '$data/GermanyFairShare.js';

	let value;
	const steps = [
		'<p>Historical emissions</p>',
		'<p>Above 4 degrees scenario</p>',
		'<p>4 degrees scenario</p>',
		'<p>3 degrees scenario</p>',
		'<p>2 degrees scenario</p>',
		'<p>1.5 degrees scenario</p>',
		'<p>1.5 bottom range scenario</p>'
	];

	let show = false;
</script>

<article>
	<div class="section-container">
		<section class="steps-container">
			<Scrolly bind:value>
				{#each steps as text, i}
					<div class="step" class:active={value === i}>
						<div class="step-content">{@html text}</div>
					</div>
				{/each}
				<div class="spacer" />
			</Scrolly>
		</section>
		<section class="sticky">
			<EmissionsChart datapoints={GermanyData} step={value} fairsharedata={GermanyFairShare}/>
		</section>
	</div>
</article>

<style>
	article {
		font-family: monospace;
	}

	.spacer {
		height: 40vh;
	}

	.sticky {
		position: sticky;
		top: 10%;
		flex: 1 1 130%;
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
		opacity: 50%;
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
		opacity: 100%;
	}

	.steps-container,
	.sticky {
		height: 100%;
	}

	.steps-container {
		flex: 1 1 40%;
		z-index: 10;
	}

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
