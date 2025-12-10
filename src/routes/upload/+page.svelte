<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import PairingCode from '../../components/PairingCode.svelte';
	import FileUploader from '../../components/FileUploader.svelte';
	import FileList from '../../components/FileList.svelte';
	import { getStoredSession, saveSession, clearSession } from '$lib/utils';
	import { createSession, getSessionById, addFileMetadata, getFilesBySession, deleteFileMetadata, type FileMetadata } from '$lib/firestore';
	import { uploadFile, deleteFile, getStoragePath } from '$lib/storage';

	interface UploadingFile {
		id: string;
		name: string;
		size: number;
		progress: number;
	}

	let loading = $state(true);
	let sessionCode = $state('');
	let sessionId = $state('');
	let files = $state<FileMetadata[]>([]);
	let uploadingFiles = $state<UploadingFile[]>([]);

	onMount(async () => {
		// Check for existing session
		const stored = getStoredSession();
		if (stored) {
			const session = await getSessionById(stored.sessionId);
			if (session) {
				sessionId = session.id;
				sessionCode = session.code;
				files = await getFilesBySession(session.id);
				loading = false;
				return;
			}
		}

		// Create new session
		const session = await createSession();
		sessionId = session.id;
		sessionCode = session.code;
		saveSession(session.id, session.code);
		loading = false;
	});

	async function handleFilesSelected(selectedFiles: File[]) {
		for (const file of selectedFiles) {
			const tempId = crypto.randomUUID();

			// Add to uploading list
			uploadingFiles = [...uploadingFiles, {
				id: tempId,
				name: file.name,
				size: file.size,
				progress: 0
			}];

			try {
				// Upload to Firebase Storage
				const downloadUrl = await uploadFile(
					sessionId,
					tempId,
					file,
					(progress) => {
						uploadingFiles = uploadingFiles.map(f =>
							f.id === tempId ? { ...f, progress: progress.progress } : f
						);
					}
				);

				// Save metadata to Firestore
				const metadata = await addFileMetadata({
					sessionId,
					name: file.name,
					size: file.size,
					type: file.type,
					storagePath: getStoragePath(sessionId, tempId, file.name),
					downloadUrl,
					uploadedAt: new Date()
				});

				// Remove from uploading, add to files
				uploadingFiles = uploadingFiles.filter(f => f.id !== tempId);
				files = [metadata, ...files];
			} catch (error) {
				console.error('Upload failed:', error);
				uploadingFiles = uploadingFiles.filter(f => f.id !== tempId);
			}
		}
	}

	async function handleDelete(file: FileMetadata) {
		try {
			// Delete from Storage
			await deleteFile(file.storagePath);
			// Delete metadata from Firestore
			await deleteFileMetadata(file.id);
			// Update local state
			files = files.filter(f => f.id !== file.id);
		} catch (error) {
			console.error('Delete failed:', error);
		}
	}

	function handleNewSession() {
		clearSession();
		goto('/');
	}
</script>

<svelte:head>
	<title>Upload Files - Send2Kobo</title>
</svelte:head>

{#if loading}
	<div class="loading">
		<p>Setting up your session...</p>
	</div>
{:else}
	<div class="upload-page">
		<header>
			<a href="/" class="logo">Send2Kobo</a>
			<button class="new-session" onclick={handleNewSession}>New Session</button>
		</header>

		<main>
			<PairingCode code={sessionCode} />

			<section class="upload-section">
				<h2>Upload Files</h2>
				<FileUploader onFilesSelected={handleFilesSelected} disabled={uploadingFiles.length > 0} />
			</section>

			<section class="files-section">
				<h2>Your Files</h2>
				<FileList {files} {uploadingFiles} onDelete={handleDelete} />
			</section>
		</main>
	</div>
{/if}

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
	}

	.upload-page {
		min-height: 100vh;
		max-width: 800px;
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

	.new-session {
		padding: 0.5rem 1rem;
		background: none;
		border: 1px solid #ddd;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.new-session:hover {
		background: #f5f5f5;
	}

	main {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.upload-section {
		margin-bottom: 1rem;
	}
</style>
