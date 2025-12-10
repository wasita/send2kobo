<script lang="ts">
	import { isValidFileType, isValidFileSize, ALLOWED_EXTENSIONS, formatFileSize, MAX_FILE_SIZE } from '$lib/utils';

	interface Props {
		onFilesSelected: (files: File[]) => void;
		disabled?: boolean;
	}

	let { onFilesSelected, disabled = false }: Props = $props();

	let isDragging = $state(false);
	let fileInput: HTMLInputElement;
	let error = $state('');

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		if (!disabled) isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (disabled) return;

		const files = e.dataTransfer?.files;
		if (files) {
			processFiles(Array.from(files));
		}
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			processFiles(Array.from(input.files));
		}
		// Reset input so same file can be selected again
		input.value = '';
	}

	function processFiles(files: File[]) {
		error = '';
		const validFiles: File[] = [];
		const errors: string[] = [];

		for (const file of files) {
			if (!isValidFileType(file.name)) {
				errors.push(`"${file.name}" - unsupported format`);
			} else if (!isValidFileSize(file.size)) {
				errors.push(`"${file.name}" - exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`);
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
		if (!disabled) {
			fileInput.click();
		}
	}
</script>

<div
	class="uploader"
	class:dragging={isDragging}
	class:disabled
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
	ondragover={handleDragOver}
	ondrop={handleDrop}
	onclick={openFilePicker}
	onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
	role="button"
	tabindex={disabled ? -1 : 0}
>
	<input
		bind:this={fileInput}
		type="file"
		multiple
		accept={ALLOWED_EXTENSIONS.join(',')}
		onchange={handleFileSelect}
	/>

	<div class="content">
		<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="17 8 12 3 7 8" />
			<line x1="12" y1="3" x2="12" y2="15" />
		</svg>
		<p class="main-text">
			{#if isDragging}
				Drop files here
			{:else}
				Drag & drop files or click to browse
			{/if}
		</p>
		<p class="sub-text">
			EPUB, PDF, MOBI, TXT, CBZ, CBR and more • Max {formatFileSize(MAX_FILE_SIZE)} per file
		</p>
	</div>
</div>

{#if error}
	<p class="error">{error}</p>
{/if}

<style>
	.uploader {
		border: 3px dashed #ccc;
		border-radius: 16px;
		padding: 3rem 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		background: #fafafa;
	}

	.uploader:hover:not(.disabled) {
		border-color: #999;
		background: #f5f5f5;
	}

	.uploader.dragging {
		border-color: #333;
		background: #f0f0f0;
	}

	.uploader.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	input[type="file"] {
		display: none;
	}

	.content {
		pointer-events: none;
	}

	.icon {
		width: 48px;
		height: 48px;
		color: #666;
		margin-bottom: 1rem;
	}

	.main-text {
		font-size: 1.25rem;
		font-weight: 500;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.sub-text {
		font-size: 0.875rem;
		color: #888;
	}

	.error {
		color: #d32f2f;
		font-size: 0.875rem;
		margin-top: 0.5rem;
		text-align: center;
	}
</style>
