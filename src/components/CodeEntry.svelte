<script lang="ts">
	interface Props {
		onSubmit: (code: string) => void;
		error?: string;
		loading?: boolean;
	}

	let { onSubmit, error = '', loading = false }: Props = $props();

	let code = $state('');

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		// Only allow alphanumeric, uppercase
		code = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (code.length === 6 && !loading) {
			onSubmit(code);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSubmit(e);
		}
	}
</script>

<div class="code-entry">
	<form onsubmit={handleSubmit}>
		<label for="pairing-code">Enter pairing code:</label>
		<input
			id="pairing-code"
			type="text"
			value={code}
			oninput={handleInput}
			onkeydown={handleKeydown}
			placeholder="ABC123"
			maxlength="6"
			autocomplete="off"
			autocapitalize="characters"
			disabled={loading}
		/>
		{#if error}
			<p class="error">{error}</p>
		{/if}
		<button type="submit" disabled={code.length !== 6 || loading}>
			{loading ? 'Connecting...' : 'Connect'}
		</button>
	</form>
</div>

<style>
	.code-entry {
		max-width: 400px;
		margin: 0 auto;
		padding: 2rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		font-size: 1.25rem;
		font-weight: 500;
		text-align: center;
	}

	input {
		font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
		font-size: 2.5rem;
		text-align: center;
		padding: 1rem;
		border: 3px solid #333;
		border-radius: 12px;
		letter-spacing: 0.5rem;
		text-transform: uppercase;
	}

	input:focus {
		outline: none;
		border-color: #000;
	}

	input:disabled {
		background: #f5f5f5;
	}

	.error {
		color: #d32f2f;
		text-align: center;
		font-size: 1rem;
		margin: 0;
	}

	button {
		font-size: 1.5rem;
		padding: 1rem 2rem;
		background: #000;
		color: white;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-weight: 600;
	}

	button:hover:not(:disabled) {
		background: #333;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
</style>
