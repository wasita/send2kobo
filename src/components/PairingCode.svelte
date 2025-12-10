<script lang="ts">
	interface Props {
		code: string;
	}

	let { code }: Props = $props();
</script>

<div class="pairing-container">
	<p class="label">Your pairing code:</p>
	<div class="code">
		{#each code.split('') as char, i}
			<span class="char">{char}</span>
			{#if i === 2}
				<span class="separator">-</span>
			{/if}
		{/each}
	</div>
	<p class="hint">Enter this code on your Kobo to download files</p>
</div>

<style>
	.pairing-container {
		text-align: center;
		padding: 2rem;
		background: #f8f9fa;
		border-radius: 12px;
		margin: 1.5rem 0;
	}

	.label {
		font-size: 1rem;
		color: #666;
		margin-bottom: 1rem;
	}

	.code {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
	}

	.char {
		font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
		font-size: 3rem;
		font-weight: bold;
		background: white;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		border: 2px solid #e0e0e0;
		min-width: 3.5rem;
		text-align: center;
	}

	.separator {
		font-size: 2rem;
		color: #999;
	}

	.hint {
		font-size: 0.875rem;
		color: #888;
		margin-top: 1rem;
	}
</style>
