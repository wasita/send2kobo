import {
	ref,
	uploadBytesResumable,
	getDownloadURL,
	deleteObject
} from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgress {
	bytesTransferred: number;
	totalBytes: number;
	progress: number;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

// Upload a file to Firebase Storage
export function uploadFile(
	sessionId: string,
	fileId: string,
	file: File,
	onProgress?: UploadProgressCallback
): Promise<string> {
	var storagePath = 'uploads/' + sessionId + '/' + fileId + '/' + file.name;
	var storageRef = ref(storage, storagePath);

	return new Promise(function(resolve, reject) {
		var uploadTask = uploadBytesResumable(storageRef, file);

		uploadTask.on(
			'state_changed',
			function(snapshot) {
				if (onProgress) {
					onProgress({
						bytesTransferred: snapshot.bytesTransferred,
						totalBytes: snapshot.totalBytes,
						progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
					});
				}
			},
			function(error) {
				reject(error);
			},
			function() {
				getDownloadURL(uploadTask.snapshot.ref).then(function(downloadUrl) {
					resolve(downloadUrl);
				}).catch(function(error) {
					reject(error);
				});
			}
		);
	});
}

// Delete a file from Firebase Storage
export function deleteFile(storagePath: string): Promise<void> {
	var storageRef = ref(storage, storagePath);
	return deleteObject(storageRef);
}

// Get storage path for a file
export function getStoragePath(sessionId: string, fileId: string, filename: string): string {
	return 'uploads/' + sessionId + '/' + fileId + '/' + filename;
}
