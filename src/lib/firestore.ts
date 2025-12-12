import {
	collection,
	doc,
	setDoc,
	getDoc,
	getDocs,
	deleteDoc,
	updateDoc,
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

var SESSIONS_COLLECTION = 'sessions';
var FILES_COLLECTION = 'files';
var SESSION_DURATION_DAYS = 90; // 3 months

// Create a new session with a unique pairing code
export function createSession(): Promise<Session> {
	var sessionsRef = collection(db, SESSIONS_COLLECTION);

	function tryCreateWithCode(): Promise<Session> {
		var code = generatePairingCode();
		var q = query(sessionsRef, where('code', '==', code));

		return getDocs(q).then(function(snapshot) {
			if (!snapshot.empty) {
				// Code not unique, try again
				return tryCreateWithCode();
			}

			var now = new Date();
			var expiresAt = new Date(now.getTime() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

			var sessionDoc = doc(sessionsRef);
			var session: Session = {
				id: sessionDoc.id,
				code: code,
				createdAt: now,
				expiresAt: expiresAt
			};

			return setDoc(sessionDoc, {
				code: code,
				createdAt: Timestamp.fromDate(now),
				expiresAt: Timestamp.fromDate(expiresAt)
			}).then(function() {
				return session;
			});
		});
	}

	return tryCreateWithCode();
}

// Extend a session's expiration by another SESSION_DURATION_DAYS
function extendSession(sessionId: string): Promise<Date> {
	var now = new Date();
	var newExpiresAt = new Date(now.getTime() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
	return updateDoc(doc(db, SESSIONS_COLLECTION, sessionId), {
		expiresAt: Timestamp.fromDate(newExpiresAt)
	}).then(function() {
		return newExpiresAt;
	});
}

// Get session by ID (extends expired sessions automatically)
export function getSessionById(sessionId: string): Promise<Session | null> {
	return getDoc(doc(db, SESSIONS_COLLECTION, sessionId)).then(function(sessionDoc) {
		if (!sessionDoc.exists()) {
			return null;
		}

		var data = sessionDoc.data();
		var session: Session = {
			id: sessionDoc.id,
			code: data.code,
			createdAt: data.createdAt.toDate(),
			expiresAt: data.expiresAt.toDate()
		};

		// If expired, extend the session
		if (session.expiresAt < new Date()) {
			return extendSession(sessionId).then(function(newExpiresAt) {
				session.expiresAt = newExpiresAt;
				return session;
			});
		}

		return session;
	});
}

// Get session by pairing code (extends expired sessions automatically)
export function getSessionByCode(code: string): Promise<Session | null> {
	var sessionsRef = collection(db, SESSIONS_COLLECTION);
	var q = query(sessionsRef, where('code', '==', code.toUpperCase()));

	return getDocs(q).then(function(snapshot) {
		if (snapshot.empty) {
			return null;
		}

		var sessionDoc = snapshot.docs[0];
		var data = sessionDoc.data();
		var session: Session = {
			id: sessionDoc.id,
			code: data.code,
			createdAt: data.createdAt.toDate(),
			expiresAt: data.expiresAt.toDate()
		};

		// If expired, extend the session
		if (session.expiresAt < new Date()) {
			return extendSession(session.id).then(function(newExpiresAt) {
				session.expiresAt = newExpiresAt;
				return session;
			});
		}

		return session;
	});
}

// Add file metadata
export function addFileMetadata(file: Omit<FileMetadata, 'id'>): Promise<FileMetadata> {
	var filesRef = collection(db, FILES_COLLECTION);
	var fileDoc = doc(filesRef);

	var metadata: FileMetadata = {
		id: fileDoc.id,
		sessionId: file.sessionId,
		name: file.name,
		size: file.size,
		type: file.type,
		storagePath: file.storagePath,
		downloadUrl: file.downloadUrl,
		uploadedAt: file.uploadedAt
	};

	return setDoc(fileDoc, {
		sessionId: file.sessionId,
		name: file.name,
		size: file.size,
		type: file.type,
		storagePath: file.storagePath,
		downloadUrl: file.downloadUrl,
		uploadedAt: Timestamp.fromDate(file.uploadedAt)
	}).then(function() {
		return metadata;
	});
}

// Get files for a session
export function getFilesBySession(sessionId: string): Promise<FileMetadata[]> {
	var filesRef = collection(db, FILES_COLLECTION);
	var q = query(
		filesRef,
		where('sessionId', '==', sessionId),
		orderBy('uploadedAt', 'desc')
	);

	return getDocs(q).then(function(snapshot) {
		var results: FileMetadata[] = [];
		for (var i = 0; i < snapshot.docs.length; i++) {
			var docSnap = snapshot.docs[i];
			var data = docSnap.data();
			results.push({
				id: docSnap.id,
				sessionId: data.sessionId,
				name: data.name,
				size: data.size,
				type: data.type,
				storagePath: data.storagePath,
				downloadUrl: data.downloadUrl,
				uploadedAt: data.uploadedAt.toDate()
			});
		}
		return results;
	});
}

// Delete file metadata
export function deleteFileMetadata(fileId: string): Promise<void> {
	return deleteDoc(doc(db, FILES_COLLECTION, fileId));
}
