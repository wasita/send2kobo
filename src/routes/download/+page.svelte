<script>
	import { onMount } from 'svelte';
	import CodeEntry from '../../components/CodeEntry.svelte';
	import FileList from '../../components/FileList.svelte';
	import { getSessionByCode, getFilesBySession } from '$lib/firestore';

	var connected = $state(false);
	var loading = $state(false);
	var error = $state('');
	var sessionCode = $state('');
	var files = $state([]);

	onMount(function() {
		// Check for code in URL query params
		var urlParams = new URLSearchParams(window.location.search);
		var codeParam = urlParams.get('code');

		if (codeParam) {
			var cleanCode = codeParam.toUpperCase().replace(/[^A-Z0-9]/g, '');
			if (cleanCode.length === 6) {
				handleCodeSubmit(cleanCode);
			}
		}
	});

	function handleCodeSubmit(code) {
		loading = true;
		error = '';

		getSessionByCode(code).then(function(session) {
			if (!session) {
				error = 'Invalid or expired code. Please try again.';
				loading = false;
				return;
			}

			sessionCode = session.code;
			return getFilesBySession(session.id);
		}).then(function(result) {
			if (result) {
				files = result;
				connected = true;
			}
			loading = false;
		}).catch(function(err) {
			console.error('Connection error:', err);
			error = 'Connection failed. Please try again.';
			loading = false;
		});
	}

	function handleDisconnect() {
		connected = false;
		sessionCode = '';
		files = [];
		error = '';
	}

	function handleRefresh() {
		if (!sessionCode) return;

		loading = true;
		getSessionByCode(sessionCode).then(function(session) {
			if (session) {
				return getFilesBySession(session.id);
			}
			return [];
		}).then(function(result) {
			files = result;
			loading = false;
		}).catch(function(err) {
			console.error('Refresh error:', err);
			loading = false;
		});
	}
</script>

<svelte:head>
	<title>Download Files - Send2Kobo</title>
</svelte:head>

<div class="download-page">
	<header class="page-header">
		<a href="/" class="logo">Send2Kobo</a>
		{#if connected}
			<button class="btn btn-outline" onclick={handleDisconnect}>Disconnect</button>
		{/if}
	</header>

	{#if !connected}
		<div class="entry-container">
			<h1 class="mb-8">Download Files</h1>
			<p class="mb-24">Enter the code shown on your computer</p>
			<CodeEntry onSubmit={handleCodeSubmit} {error} {loading} />
		</div>
	{:else}
		<div class="connected-container">
			<div class="session-info">
				<p>Connected to session:</p>
				<p class="session-code">{sessionCode}</p>
				<button class="btn mt-16" onclick={handleRefresh} disabled={loading}>
					{loading ? 'Refreshing...' : 'Refresh'}
				</button>
			</div>

			<section class="mt-24">
				<h2 class="mb-16">Available Files</h2>
				<FileList {files} showDelete={false} />
			</section>
		</div>
	{/if}
</div>

<style>
	.download-page {
		padding: 16px 0;
	}

	.page-header {
		display: block;
		margin-bottom: 24px;
		padding-bottom: 16px;
		border-bottom: 2px solid #000;
	}

	.logo {
		font-size: 20px;
		font-weight: bold;
		text-decoration: none;
		display: block;
		margin-bottom: 12px;
	}

	.entry-container {
		text-align: center;
		padding-top: 24px;
	}

	.entry-container h1 {
		font-size: 24px;
	}

	.session-info {
		text-align: center;
		padding: 16px;
		border: 3px solid #000;
		background: #fff;
	}

	.session-code {
		font-family: monospace;
		font-size: 24px;
		font-weight: bold;
		letter-spacing: 4px;
		margin: 8px 0;
	}

	h2 {
		font-size: 18px;
	}
</style>
