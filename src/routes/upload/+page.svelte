<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import PairingCode from '../../components/PairingCode.svelte';
	import FileUploader from '../../components/FileUploader.svelte';
	import FileList from '../../components/FileList.svelte';
	import { getStoredSession, saveSession, clearSession } from '$lib/utils';
	import { createSession, getSessionById, getSessionByCode, addFileMetadata, getFilesBySession, deleteFileMetadata } from '$lib/firestore';
	import { uploadFile, deleteFile, getStoragePath } from '$lib/storage';

	var loading = $state(true);
	var sessionCode = $state('');
	var sessionId = $state('');
	var files = $state([]);
	var uploadingFiles = $state([]);

	onMount(function() {
		initSession();
	});

	function initSession() {
		// Check for code in URL query params first
		var urlParams = new URLSearchParams(window.location.search);
		var codeParam = urlParams.get('code');

		if (codeParam) {
			// Try to connect with the provided code
			var cleanCode = codeParam.toUpperCase().replace(/[^A-Z0-9]/g, '');
			if (cleanCode.length === 6) {
				connectWithCode(cleanCode);
				return;
			}
		}

		// Otherwise check stored session
		var stored = getStoredSession();
		if (stored) {
			getSessionById(stored.sessionId).then(function(session) {
				if (session) {
					sessionId = session.id;
					sessionCode = session.code;
					return getFilesBySession(session.id);
				}
				return createNewSession();
			}).then(function(result) {
				if (Array.isArray(result)) {
					files = result;
				}
				loading = false;
			}).catch(function() {
				createNewSession().then(function() {
					loading = false;
				});
			});
		} else {
			createNewSession().then(function() {
				loading = false;
			});
		}
	}

	function connectWithCode(code) {
		getSessionByCode(code).then(function(session) {
			if (session) {
				sessionId = session.id;
				sessionCode = session.code;
				saveSession(session.id, session.code);
				return getFilesBySession(session.id);
			} else {
				// Code not found - show error, don't auto-create new session
				console.error('Session not found for code:', code);
				alert('Session code not found: ' + code);
				return createNewSession();
			}
		}).then(function(result) {
			if (Array.isArray(result)) {
				files = result;
			}
			loading = false;
		}).catch(function(err) {
			console.error('Error connecting with code:', err);
			alert('Error connecting to session: ' + code);
			createNewSession().then(function() {
				loading = false;
			});
		});
	}

	function createNewSession() {
		return createSession().then(function(session) {
			sessionId = session.id;
			sessionCode = session.code;
			saveSession(session.id, session.code);
		});
	}

	function handleFilesSelected(selectedFiles) {
		for (var i = 0; i < selectedFiles.length; i++) {
			uploadSingleFile(selectedFiles[i]);
		}
	}

	function uploadSingleFile(file) {
		var tempId = generateId();

		uploadingFiles = uploadingFiles.concat([{
			id: tempId,
			name: file.name,
			size: file.size,
			progress: 0
		}]);

		uploadFile(
			sessionId,
			tempId,
			file,
			function(progress) {
				uploadingFiles = uploadingFiles.map(function(f) {
					if (f.id === tempId) {
						return { id: f.id, name: f.name, size: f.size, progress: progress.progress };
					}
					return f;
				});
			}
		).then(function(downloadUrl) {
			return addFileMetadata({
				sessionId: sessionId,
				name: file.name,
				size: file.size,
				type: file.type,
				storagePath: getStoragePath(sessionId, tempId, file.name),
				downloadUrl: downloadUrl,
				uploadedAt: new Date()
			});
		}).then(function(metadata) {
			uploadingFiles = uploadingFiles.filter(function(f) {
				return f.id !== tempId;
			});
			files = [metadata].concat(files);
		}).catch(function(error) {
			console.error('Upload failed:', error);
			uploadingFiles = uploadingFiles.filter(function(f) {
				return f.id !== tempId;
			});
		});
	}

	function generateId() {
		var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
		var result = '';
		for (var i = 0; i < 16; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	function handleDelete(file) {
		deleteFile(file.storagePath).then(function() {
			return deleteFileMetadata(file.id);
		}).then(function() {
			files = files.filter(function(f) {
				return f.id !== file.id;
			});
		}).catch(function(error) {
			console.error('Delete failed:', error);
		});
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
		<header class="page-header">
			<a href="/" class="logo">Send2Kobo</a>
			<button class="btn btn-outline" onclick={handleNewSession}>New Session</button>
		</header>

		<PairingCode code={sessionCode} />

		<section class="mb-24">
			<h2 class="mb-16">Upload Files</h2>
			<FileUploader onFilesSelected={handleFilesSelected} disabled={uploadingFiles.length > 0} />
		</section>

		<section>
			<h2 class="mb-16">Your Files</h2>
			<FileList {files} {uploadingFiles} onDelete={handleDelete} />
		</section>
	</div>
{/if}

<style>
	.upload-page {
		padding: 16px 0;
	}

	.page-header {
		display: block;
		margin-bottom: 24px;
		padding-bottom: 16px;
		border-bottom: 2px solid #000;
	}

	.logo {
		font-size: 20px;
		font-weight: bold;
		text-decoration: none;
		display: block;
		margin-bottom: 12px;
	}

	h2 {
		font-size: 18px;
	}
</style>
