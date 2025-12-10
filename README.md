# Send2Kobo

Transfer files to your Kobo e-reader wirelessly using a simple pairing code.

## Features

- Upload files from your computer or phone
- Download on your Kobo e-reader using a 6-character pairing code
- Supports all Kobo-compatible formats: EPUB, PDF, MOBI, TXT, CBZ, CBR, and more
- E-ink optimized download interface
- Sessions expire after 24 hours
- 100MB max file size

## Supported File Formats

- **Books:** EPUB, PDF, MOBI, KEPUB
- **Text:** TXT, HTML, RTF
- **Comics:** CBZ, CBR
- **Images:** JPEG, PNG, BMP, TIFF, GIF

## Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database** (start in test mode)
4. Enable **Storage** (start in test mode)
5. Register a web app and copy the config

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Firebase config:

```sh
cp .env.example .env
```

```
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Install Dependencies

```sh
npm install
```

### 4. Run Development Server

```sh
npm run dev
```

## Deployment to Firebase Hosting

### 1. Install Firebase CLI

```sh
npm install -g firebase-tools
```

### 2. Login and Initialize

```sh
firebase login
firebase init
```

Select:
- Firestore (to deploy security rules)
- Storage (to deploy security rules)
- Hosting (select "build" as public directory)

### 3. Deploy Security Rules

```sh
firebase deploy --only firestore:rules,storage:rules
```

### 4. Build and Deploy

```sh
npm run build
firebase deploy --only hosting
```

## How It Works

1. **On your computer:** Visit the site, get a 6-character pairing code, and upload files
2. **On your Kobo:** Open the browser, go to the same site, enter the code, and download your files

## Development

```sh
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run check
```

## Tech Stack

- **Frontend:** SvelteKit + TypeScript
- **Backend:** Firebase (Firestore + Storage)
- **Hosting:** Firebase Hosting
