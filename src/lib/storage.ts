import {
	ref,
	uploadBytesResumable,
	getDownloadURL,
	deleteObject,
	type UploadTaskSnapshot
} from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgress {
	bytesTransferred: number;
	totalBytes: number;
	progress: number;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

// Upload a file to Firebase Storage
export async function uploadFile(
	sessionId: string,
	fileId: string,
	file: File,
	onProgress?: UploadProgressCallback
): Promise<string> {
	const storagePath = `uploads/${sessionId}/${fileId}/${file.name}`;
	const storageRef = ref(storage, storagePath);

	return new Promise((resolve, reject) => {
		const uploadTask = uploadBytesResumable(storageRef, file);

		uploadTask.on(
			'state_changed',
			(snapshot: UploadTaskSnapshot) => {
				if (onProgress) {
					onProgress({
						bytesTransferred: snapshot.bytesTransferred,
						totalBytes: snapshot.totalBytes,
						progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
					});
				}
			},
			(error) => {
				reject(error);
			},
			async () => {
				const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
				resolve(downloadUrl);
			}
		);
	});
}

// Delete a file from Firebase Storage
export async function deleteFile(storagePath: string): Promise<void> {
	const storageRef = ref(storage, storagePath);
	await deleteObject(storageRef);
}

// Get storage path for a file
export function getStoragePath(sessionId: string, fileId: string, filename: string): string {
	return `uploads/${sessionId}/${fileId}/${filename}`;
}
