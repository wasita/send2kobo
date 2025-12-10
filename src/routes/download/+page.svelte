<script lang="ts">
	import CodeEntry from '../../components/CodeEntry.svelte';
	import FileList from '../../components/FileList.svelte';
	import { getSessionByCode, getFilesBySession, type FileMetadata } from '$lib/firestore';

	let connected = $state(false);
	let loading = $state(false);
	let error = $state('');
	let sessionCode = $state('');
	let files = $state<FileMetadata[]>([]);

	async function handleCodeSubmit(code: string) {
		loading = true;
		error = '';

		try {
			const session = await getSessionByCode(code);

			if (!session) {
				error = 'Invalid or expired code. Please try again.';
				loading = false;
				return;
			}

			sessionCode = session.code;
			files = await getFilesBySession(session.id);
			connected = true;
		} catch (err) {
			console.error('Connection error:', err);
			error = 'Connection failed. Please try again.';
		}

		loading = false;
	}

	function handleDisconnect() {
		connected = false;
		sessionCode = '';
		files = [];
		error = '';
	}

	async function handleRefresh() {
		if (!sessionCode) return;

		loading = true;
		try {
			const session = await getSessionByCode(sessionCode);
			if (session) {
				files = await getFilesBySession(session.id);
			}
		} catch (err) {
			console.error('Refresh error:', err);
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>Download Files - Send2Kobo</title>
</svelte:head>

<div class="download-page">
	<header>
		<a href="/" class="logo">Send2Kobo</a>
		{#if connected}
			<button class="disconnect" onclick={handleDisconnect}>Disconnect</button>
		{/if}
	</header>

	<main>
		{#if !connected}
			<div class="entry-container">
				<h1>Download Files</h1>
				<p class="subtitle">Enter the code shown on your computer</p>
				<CodeEntry onSubmit={handleCodeSubmit} {error} {loading} />
			</div>
		{:else}
			<div class="connected-container">
				<div class="session-info">
					<span class="connected-label">Connected to session</span>
					<span class="session-code">{sessionCode}</span>
					<button class="refresh-btn" onclick={handleRefresh} disabled={loading}>
						{loading ? 'Refreshing...' : 'Refresh'}
					</button>
				</div>

				<section class="files-section">
					<h2>Available Files</h2>
					<FileList {files} showDelete={false} />
				</section>
			</div>
		{/if}
	</main>
</div>

<style>
	.download-page {
		min-height: 100vh;
		max-width: 600px;
		margin: 0 auto;
		padding: 1.5rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 700;
		text-decoration: none;
		color: inherit;
	}

	.disconnect {
		padding: 0.75rem 1.5rem;
		background: none;
		border: 2px solid #333;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
	}

	.disconnect:hover {
		background: #f5f5f5;
	}

	main {
		display: flex;
		flex-direction: column;
	}

	.entry-container {
		text-align: center;
		padding-top: 2rem;
	}

	.entry-container h1 {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #666;
		margin-bottom: 2rem;
		font-size: 1.125rem;
	}

	.connected-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.session-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem;
		background: #f0f9f0;
		border-radius: 12px;
		border: 2px solid #4caf50;
	}

	.connected-label {
		font-size: 0.875rem;
		color: #2e7d32;
	}

	.session-code {
		font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
		font-size: 1.5rem;
		font-weight: bold;
		letter-spacing: 0.25rem;
	}

	.refresh-btn {
		margin-top: 0.5rem;
		padding: 0.75rem 2rem;
		background: #333;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
	}

	.refresh-btn:hover:not(:disabled) {
		background: #555;
	}

	.refresh-btn:disabled {
		background: #999;
		cursor: not-allowed;
	}

	.files-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	/* E-ink friendly overrides - high contrast, large touch targets */
	:global(.download-page .file-item) {
		padding: 1.25rem;
	}

	:global(.download-page .download-btn) {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
	}
</style>
