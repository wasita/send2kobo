<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getStoredSession } from '$lib/utils';
	import { getSessionById } from '$lib/firestore';

	let loading = $state(true);

	onMount(async () => {
		// Check if there's an existing valid session
		const stored = getStoredSession();
		if (stored) {
			const session = await getSessionById(stored.sessionId);
			if (session) {
				// Valid session exists, go to upload page
				goto('/upload');
				return;
			}
		}
		loading = false;
	});
</script>

<svelte:head>
	<title>Send2Kobo - Transfer files to your e-reader</title>
</svelte:head>

{#if loading}
	<div class="loading">
		<p>Loading...</p>
	</div>
{:else}
	<div class="home">
		<header>
			<h1>Send2Kobo</h1>
			<p class="tagline">Transfer files to your Kobo e-reader wirelessly</p>
		</header>

		<main>
			<div class="options">
				<a href="/upload" class="option-card">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="17 8 12 3 7 8" />
						<line x1="12" y1="3" x2="12" y2="15" />
					</svg>
					<h2>Upload Files</h2>
					<p>From your computer or phone</p>
				</a>

				<a href="/download" class="option-card">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" y1="15" x2="12" y2="3" />
					</svg>
					<h2>Download Files</h2>
					<p>On your Kobo e-reader</p>
				</a>
			</div>
		</main>

		<footer>
			<p>Supports EPUB, PDF, MOBI, TXT, CBZ, CBR and more</p>
		</footer>
	</div>
{/if}

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
	}

	.home {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 2rem;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.tagline {
		font-size: 1.25rem;
		color: #666;
	}

	main {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.options {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.option-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 3rem 4rem;
		background: #f8f9fa;
		border: 2px solid #e0e0e0;
		border-radius: 16px;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
	}

	.option-card:hover {
		border-color: #333;
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.option-card svg {
		width: 64px;
		height: 64px;
		margin-bottom: 1.5rem;
		color: #333;
	}

	.option-card h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.option-card p {
		color: #666;
	}

	footer {
		text-align: center;
		padding-top: 2rem;
		color: #888;
		font-size: 0.875rem;
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 2rem;
		}

		.options {
			flex-direction: column;
		}

		.option-card {
			padding: 2rem;
			width: 100%;
		}
	}
</style>
