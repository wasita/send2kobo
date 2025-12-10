import {
	collection,
	doc,
	setDoc,
	getDoc,
	getDocs,
	deleteDoc,
	query,
	where,
	Timestamp,
	orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { generatePairingCode } from './utils';

export interface Session {
	id: string;
	code: string;
	createdAt: Date;
	expiresAt: Date;
}

export interface FileMetadata {
	id: string;
	sessionId: string;
	name: string;
	size: number;
	type: string;
	storagePath: string;
	downloadUrl: string;
	uploadedAt: Date;
}

const SESSIONS_COLLECTION = 'sessions';
const FILES_COLLECTION = 'files';
const SESSION_DURATION_HOURS = 24;

// Create a new session with a unique pairing code
export async function createSession(): Promise<Session> {
	const sessionsRef = collection(db, SESSIONS_COLLECTION);
	let code: string;
	let isUnique = false;

	// Generate unique code
	do {
		code = generatePairingCode();
		const q = query(sessionsRef, where('code', '==', code));
		const snapshot = await getDocs(q);
		isUnique = snapshot.empty;
	} while (!isUnique);

	const now = new Date();
	const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

	const sessionDoc = doc(sessionsRef);
	const session: Session = {
		id: sessionDoc.id,
		code,
		createdAt: now,
		expiresAt
	};

	await setDoc(sessionDoc, {
		code,
		createdAt: Timestamp.fromDate(now),
		expiresAt: Timestamp.fromDate(expiresAt)
	});

	return session;
}

// Get session by ID
export async function getSessionById(sessionId: string): Promise<Session | null> {
	const sessionDoc = await getDoc(doc(db, SESSIONS_COLLECTION, sessionId));

	if (!sessionDoc.exists()) {
		return null;
	}

	const data = sessionDoc.data();
	const session: Session = {
		id: sessionDoc.id,
		code: data.code,
		createdAt: data.createdAt.toDate(),
		expiresAt: data.expiresAt.toDate()
	};

	// Check if expired
	if (session.expiresAt < new Date()) {
		return null;
	}

	return session;
}

// Get session by pairing code
export async function getSessionByCode(code: string): Promise<Session | null> {
	const sessionsRef = collection(db, SESSIONS_COLLECTION);
	const q = query(sessionsRef, where('code', '==', code.toUpperCase()));
	const snapshot = await getDocs(q);

	if (snapshot.empty) {
		return null;
	}

	const sessionDoc = snapshot.docs[0];
	const data = sessionDoc.data();
	const session: Session = {
		id: sessionDoc.id,
		code: data.code,
		createdAt: data.createdAt.toDate(),
		expiresAt: data.expiresAt.toDate()
	};

	// Check if expired
	if (session.expiresAt < new Date()) {
		return null;
	}

	return session;
}

// Add file metadata
export async function addFileMetadata(file: Omit<FileMetadata, 'id'>): Promise<FileMetadata> {
	const filesRef = collection(db, FILES_COLLECTION);
	const fileDoc = doc(filesRef);

	const metadata: FileMetadata = {
		...file,
		id: fileDoc.id
	};

	await setDoc(fileDoc, {
		sessionId: file.sessionId,
		name: file.name,
		size: file.size,
		type: file.type,
		storagePath: file.storagePath,
		downloadUrl: file.downloadUrl,
		uploadedAt: Timestamp.fromDate(file.uploadedAt)
	});

	return metadata;
}

// Get files for a session
export async function getFilesBySession(sessionId: string): Promise<FileMetadata[]> {
	const filesRef = collection(db, FILES_COLLECTION);
	const q = query(
		filesRef,
		where('sessionId', '==', sessionId),
		orderBy('uploadedAt', 'desc')
	);
	const snapshot = await getDocs(q);

	return snapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			id: doc.id,
			sessionId: data.sessionId,
			name: data.name,
			size: data.size,
			type: data.type,
			storagePath: data.storagePath,
			downloadUrl: data.downloadUrl,
			uploadedAt: data.uploadedAt.toDate()
		};
	});
}

// Delete file metadata
export async function deleteFileMetadata(fileId: string): Promise<void> {
	await deleteDoc(doc(db, FILES_COLLECTION, fileId));
}
