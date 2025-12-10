<script>
	import { isValidFileType, isValidFileSize, ALLOWED_EXTENSIONS, formatFileSize, MAX_FILE_SIZE } from '$lib/utils';

	var { onFilesSelected, disabled } = $props();

	var error = $state('');
	var fileInput;

	function handleFileSelect(e) {
		var input = e.target;
		if (input.files) {
			processFiles(input.files);
		}
		input.value = '';
	}

	function processFiles(fileList) {
		error = '';
		var validFiles = [];
		var errors = [];

		for (var i = 0; i < fileList.length; i++) {
			var file = fileList[i];
			if (!isValidFileType(file.name)) {
				errors.push('"' + file.name + '" - unsupported format');
			} else if (!isValidFileSize(file.size)) {
				errors.push('"' + file.name + '" - exceeds ' + formatFileSize(MAX_FILE_SIZE) + ' limit');
			} else {
				validFiles.push(file);
			}
		}

		if (errors.length > 0) {
			error = errors.join(', ');
		}

		if (validFiles.length > 0) {
			onFilesSelected(validFiles);
		}
	}

	function openFilePicker() {
		if (!disabled && fileInput) {
			fileInput.click();
		}
	}
</script>

<div class="uploader">
	<input
		bind:this={fileInput}
		type="file"
		multiple
		accept={ALLOWED_EXTENSIONS.join(',')}
		onchange={handleFileSelect}
		disabled={disabled}
	/>

	<div class="upload-box" onclick={openFilePicker}>
		<p class="main-text">Click to select files</p>
		<p class="sub-text">EPUB, PDF, MOBI, TXT, CBZ, CBR and more</p>
		<p class="sub-text">Max {formatFileSize(MAX_FILE_SIZE)} per file</p>
	</div>

	{#if disabled}
		<p class="status">Upload in progress...</p>
	{/if}
</div>

{#if error}
	<p class="error-msg">{error}</p>
{/if}

<style>
	.uploader {
		margin-bottom: 16px;
	}

	input[type="file"] {
		position: absolute;
		left: -9999px;
	}

	.upload-box {
		border: 3px dashed #000;
		padding: 32px 16px;
		text-align: center;
		cursor: pointer;
		background: #fff;
	}

	.upload-box:active {
		background: #eee;
	}

	.main-text {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 8px;
	}

	.sub-text {
		font-size: 14px;
		margin-top: 4px;
	}

	.status {
		text-align: center;
		padding: 12px;
		background: #f5f5f5;
		border: 2px solid #000;
		margin-top: 12px;
	}

	.error-msg {
		color: #000;
		font-weight: bold;
		padding: 12px;
		border: 2px solid #000;
		margin-top: 12px;
	}
</style>
