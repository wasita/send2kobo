<script lang="ts">
	import type { FileMetadata } from '$lib/firestore';
	import { formatFileSize, getFileExtension } from '$lib/utils';

	interface UploadingFile {
		id: string;
		name: string;
		size: number;
		progress: number;
	}

	interface Props {
		files: FileMetadata[];
		uploadingFiles?: UploadingFile[];
		onDelete?: (file: FileMetadata) => void;
		showDelete?: boolean;
	}

	let { files, uploadingFiles = [], onDelete, showDelete = true }: Props = $props();

	function handleDelete(file: FileMetadata) {
		if (onDelete) {
			onDelete(file);
		}
	}
</script>

<div class="file-list">
	{#if uploadingFiles.length > 0}
		{#each uploadingFiles as file (file.id)}
			<div class="file-item uploading">
				<div class="file-info">
					<span class="file-ext">{getFileExtension(file.name)}</span>
					<div class="file-details">
						<span class="file-name">{file.name}</span>
						<span class="file-size">{formatFileSize(file.size)}</span>
					</div>
				</div>
				<div class="progress-container">
					<div class="progress-bar" style="width: {file.progress}%"></div>
				</div>
			</div>
		{/each}
	{/if}

	{#each files as file (file.id)}
		<div class="file-item">
			<div class="file-info">
				<span class="file-ext">{getFileExtension(file.name)}</span>
				<div class="file-details">
					<span class="file-name">{file.name}</span>
					<span class="file-size">{formatFileSize(file.size)}</span>
				</div>
			</div>
			<div class="file-actions">
				<a href={file.downloadUrl} download={file.name} class="download-btn" target="_blank">
					Download
				</a>
				{#if showDelete && onDelete}
					<button class="delete-btn" onclick={() => handleDelete(file)} aria-label="Delete file">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="3 6 5 6 21 6" />
							<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
						</svg>
					</button>
				{/if}
			</div>
		</div>
	{/each}

	{#if files.length === 0 && uploadingFiles.length === 0}
		<p class="empty">No files uploaded yet</p>
	{/if}
</div>

<style>
	.file-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.file-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 12px;
		border: 1px solid #e0e0e0;
	}

	.file-item.uploading {
		flex-direction: column;
		align-items: stretch;
		gap: 0.75rem;
	}

	.file-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
		min-width: 0;
	}

	.file-ext {
		font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
		font-size: 0.75rem;
		font-weight: 600;
		background: #333;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		text-transform: uppercase;
	}

	.file-details {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.file-name {
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-size {
		font-size: 0.875rem;
		color: #666;
	}

	.file-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.download-btn {
		padding: 0.5rem 1rem;
		background: #000;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.download-btn:hover {
		background: #333;
	}

	.delete-btn {
		padding: 0.5rem;
		background: none;
		border: 1px solid #ddd;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-btn:hover {
		background: #fee;
		border-color: #fcc;
	}

	.delete-btn svg {
		width: 18px;
		height: 18px;
		color: #999;
	}

	.delete-btn:hover svg {
		color: #d32f2f;
	}

	.progress-container {
		width: 100%;
		height: 6px;
		background: #e0e0e0;
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: #333;
		transition: width 0.2s ease;
	}

	.empty {
		text-align: center;
		color: #888;
		padding: 2rem;
	}
</style>
