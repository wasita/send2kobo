// Allowed file extensions for Kobo e-readers
export var ALLOWED_EXTENSIONS = [
	// Books
	'.epub',
	'.pdf',
	'.mobi',
	'.kepub',
	// Text
	'.txt',
	'.html',
	'.htm',
	'.rtf',
	// Comics
	'.cbz',
	'.cbr',
	// Images
	'.jpeg',
	'.jpg',
	'.png',
	'.bmp',
	'.tiff',
	'.tif',
	'.gif'
];

export var MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB (Firebase limit)

// Generate a 6-character alphanumeric code (uppercase for readability)
export function generatePairingCode(): string {
	var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed I, O, 0, 1 to avoid confusion
	var code = '';
	for (var i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

// Validate file extension
export function isValidFileType(filename: string): boolean {
	var parts = filename.split('.');
	var ext = '.' + (parts[parts.length - 1] || '').toLowerCase();
	return ALLOWED_EXTENSIONS.indexOf(ext) !== -1;
}

// Validate file size
export function isValidFileSize(size: number): boolean {
	return size <= MAX_FILE_SIZE;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	var k = 1024;
	var sizes = ['B', 'KB', 'MB', 'GB'];
	var i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Get file extension
export function getFileExtension(filename: string): string {
	var parts = filename.split('.');
	return (parts[parts.length - 1] || '').toUpperCase();
}

// Session storage keys
export var SESSION_KEY = 'send2kobo_session';
export var SESSION_CODE_KEY = 'send2kobo_code';

// Save session to localStorage
export function saveSession(sessionId: string, code: string): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(SESSION_KEY, sessionId);
		localStorage.setItem(SESSION_CODE_KEY, code);
	}
}

// Get session from localStorage
export function getStoredSession(): { sessionId: string; code: string } | null {
	if (typeof localStorage !== 'undefined') {
		var sessionId = localStorage.getItem(SESSION_KEY);
		var code = localStorage.getItem(SESSION_CODE_KEY);
		if (sessionId && code) {
			return { sessionId: sessionId, code: code };
		}
	}
	return null;
}

// Clear session from localStorage
export function clearSession(): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem(SESSION_KEY);
		localStorage.removeItem(SESSION_CODE_KEY);
	}
}
