<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getStoredSession } from '$lib/utils';
	import { getSessionById } from '$lib/firestore';

	var loading = $state(true);

	onMount(function() {
		checkSession();
	});

	function checkSession() {
		var stored = getStoredSession();
		if (stored) {
			getSessionById(stored.sessionId).then(function(session) {
				if (session) {
					goto('/upload');
					return;
				}
				loading = false;
			}).catch(function() {
				loading = false;
			});
		} else {
			loading = false;
		}
	}
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
		<header class="header text-center">
			<h1>Send2Kobo</h1>
			<p>Transfer files to your Kobo e-reader wirelessly</p>
		</header>

		<div class="options">
			<a href="/upload" class="option-card">
				<h2>Upload Files</h2>
				<p>From your computer or phone</p>
			</a>

			<a href="/download" class="option-card">
				<h2>Download Files</h2>
				<p>On your Kobo e-reader</p>
			</a>
		</div>

		<p class="text-center mt-24">Supports EPUB, PDF, MOBI, TXT, CBZ, CBR and more</p>
	</div>
{/if}

<style>
	.home {
		padding: 16px 0;
	}

	.options {
		margin-top: 24px;
	}

	.option-card {
		display: block;
		padding: 24px;
		border: 3px solid #000;
		margin-bottom: 16px;
		text-decoration: none;
		background: #fff;
	}

	.option-card:active {
		background: #eee;
	}

	.option-card h2 {
		font-size: 20px;
		margin-bottom: 8px;
	}

	.option-card p {
		color: #333;
	}
</style>
