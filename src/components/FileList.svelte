<script>
	import { formatFileSize, getFileExtension } from '$lib/utils';

	var { files, uploadingFiles, onDelete, showDelete } = $props();

	function handleDelete(file) {
		if (onDelete) {
			onDelete(file);
		}
	}
</script>

<div class="file-list">
	{#if uploadingFiles && uploadingFiles.length > 0}
		{#each uploadingFiles as file (file.id)}
			<div class="file-item uploading">
				<div class="file-info">
					<span class="file-ext">{getFileExtension(file.name)}</span>
					<span class="file-name">{file.name}</span>
					<span class="file-size">{formatFileSize(file.size)}</span>
				</div>
				<div class="progress-container">
					<div class="progress-bar" style="width: {file.progress}%"></div>
				</div>
				<p class="progress-text">{Math.round(file.progress)}% uploaded</p>
			</div>
		{/each}
	{/if}

	{#each files as file (file.id)}
		<div class="file-item">
			<div class="file-info">
				<span class="file-ext">{getFileExtension(file.name)}</span>
				<span class="file-name">{file.name}</span>
				<span class="file-size">{formatFileSize(file.size)}</span>
			</div>
			<div class="file-actions">
				<a href={file.downloadUrl} download={file.name} class="btn" target="_blank">
					Download
				</a>
				{#if showDelete !== false && onDelete}
					<button class="btn btn-outline" onclick={() => handleDelete(file)}>
						Delete
					</button>
				{/if}
			</div>
		</div>
	{/each}

	{#if files.length === 0 && (!uploadingFiles || uploadingFiles.length === 0)}
		<p class="empty">No files uploaded yet</p>
	{/if}
</div>

<style>
	.file-list {
		margin: 0;
		padding: 0;
	}

	.file-item {
		padding: 16px;
		border: 2px solid #000;
		margin-bottom: 12px;
		background: #fff;
	}

	.file-item.uploading {
		background: #f5f5f5;
	}

	.file-info {
		margin-bottom: 12px;
	}

	.file-ext {
		display: inline-block;
		font-family: monospace;
		font-size: 12px;
		font-weight: bold;
		background: #000;
		color: #fff;
		padding: 4px 8px;
		margin-right: 8px;
		text-transform: uppercase;
	}

	.file-name {
		display: block;
		font-weight: bold;
		margin-top: 8px;
		word-break: break-all;
	}

	.file-size {
		display: block;
		font-size: 14px;
		margin-top: 4px;
	}

	.file-actions {
		margin-top: 12px;
	}

	.file-actions a,
	.file-actions button {
		margin-right: 8px;
		margin-bottom: 8px;
	}

	.progress-container {
		width: 100%;
		height: 12px;
		background: #ddd;
		border: 1px solid #000;
	}

	.progress-bar {
		height: 100%;
		background: #000;
	}

	.progress-text {
		font-size: 14px;
		margin-top: 8px;
	}

	.empty {
		text-align: center;
		padding: 32px;
		border: 2px dashed #000;
	}
</style>
