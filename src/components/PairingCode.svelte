<script>
	var { code } = $props();
</script>

<div class="pairing-container">
	<p class="label">Your pairing code:</p>
	<div class="code">{code.substring(0, 3)}-{code.substring(3, 6)}</div>
	<p class="hint">Enter this code on your Kobo to download files</p>
</div>

<style>
	.pairing-container {
		text-align: center;
		padding: 24px;
		border: 3px solid #000;
		margin: 16px 0;
		background: #fff;
	}

	.label {
		margin-bottom: 12px;
	}

	.code {
		font-family: monospace;
		font-size: 36px;
		font-weight: bold;
		letter-spacing: 4px;
		padding: 16px;
		border: 2px solid #000;
		display: inline-block;
		background: #fff;
	}

	.hint {
		margin-top: 12px;
		font-size: 14px;
	}
</style>
