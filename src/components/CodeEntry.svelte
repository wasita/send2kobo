<script>
	var { onSubmit, error, loading } = $props();

	var code = $state('');

	function handleInput(e) {
		var input = e.target;
		code = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (code.length === 6 && !loading) {
			onSubmit(code);
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
			placeholder="ABC123"
			maxlength="6"
			autocomplete="off"
			disabled={loading}
		/>
		{#if error}
			<p class="error-msg">{error}</p>
		{/if}
		<button type="submit" class="btn" disabled={code.length !== 6 || loading}>
			{loading ? 'Connecting...' : 'Connect'}
		</button>
	</form>
</div>

<style>
	.code-entry {
		max-width: 400px;
		margin: 0 auto;
		padding: 16px;
	}

	form {
		text-align: center;
	}

	label {
		display: block;
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 16px;
	}

	input {
		display: block;
		width: 100%;
		font-family: monospace;
		font-size: 28px;
		text-align: center;
		padding: 16px;
		border: 3px solid #000;
		letter-spacing: 8px;
		text-transform: uppercase;
		margin-bottom: 16px;
		background: #fff;
	}

	input:disabled {
		background: #eee;
	}

	.error-msg {
		color: #000;
		font-weight: bold;
		margin-bottom: 16px;
		padding: 12px;
		border: 2px solid #000;
	}

	button {
		width: 100%;
		font-size: 20px;
		padding: 16px;
	}
</style>
