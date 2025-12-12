# Send2Kobo

Transfer files to your Kobo e-reader wirelessly using a simple pairing code.

## Features

- Upload files from your computer or phone
- Download on your Kobo e-reader using a 6-character pairing code
- Server-rendered Kobo page (works on Kobo's limited browser)
- Supports all Kobo-compatible formats: EPUB, PDF, MOBI, TXT, CBZ, CBR, and more
- Sessions expire after 3 months (auto-extended on access)
- 5GB max file size

## How It Works

1. **On your computer:** Visit `https://your-site.web.app/upload`, get a 6-character pairing code, and upload files
2. **On your Kobo:** Open the browser, go to `https://your-site.web.app/kobo`, enter the code, and download your files

The Kobo page (`/kobo`) is server-rendered via Cloud Functions, so it works on the Kobo's old WebKit browser which can't run modern JavaScript.

## Supported File Formats

- **Books:** EPUB, PDF, MOBI, KEPUB
- **Text:** TXT, HTML, RTF
- **Comics:** CBZ, CBR
- **Images:** JPEG, PNG, BMP, TIFF, GIF

## Tech Stack

- **Frontend:** SvelteKit + TypeScript + Vanilla CSS (no Tailwind - for e-ink compatibility)
- **Backend:** Firebase (Firestore + Storage + Cloud Functions)
- **Hosting:** Firebase Hosting

## Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. **Upgrade to Blaze plan** (required for Cloud Functions)
4. Enable **Firestore Database** (start in test mode)
5. Enable **Storage** (start in test mode)
6. Register a web app and copy the config

### 2. Configure Environment

Create a `.env` file with your Firebase config:

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
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions && npm install && cd ..
```

### 4. Run Development Server

```sh
npm run dev
```

Note: The `/kobo` endpoint requires Cloud Functions, so it won't work locally without the Firebase emulator.

## Deployment

### 1. Install Firebase CLI

```sh
npm install -g firebase-tools
firebase login
```

### 2. Build the Frontend

```sh
npm run build
```

### 3. Build Cloud Functions

```sh
cd functions && npm run build && cd ..
```

### 4. Deploy Everything

```sh
firebase deploy --project your-project-id
```

Or deploy individually:

```sh
# Deploy hosting only
firebase deploy --only hosting

# Deploy functions only
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

## Project Structure

```
send2kobo/
├── src/
│   ├── routes/           # SvelteKit pages
│   │   ├── +page.svelte  # Home page
│   │   ├── upload/       # Upload page (for computers/phones)
│   │   └── download/     # Download page (modern browsers)
│   ├── components/       # Svelte components
│   └── lib/              # Utilities, Firebase config
├── functions/
│   └── src/
│       └── index.ts      # Cloud Functions (kobo page, download proxy)
├── static/               # Static assets
└── build/                # Production build output
```

## Cloud Functions

- **`/kobo`** - Server-rendered download page for Kobo e-readers
- **`/download`** - Download proxy that sets correct filename headers
- **`cleanupExpiredSessions`** - Scheduled weekly (Sundays 3am UTC) to delete sessions expired 7+ days ago and their files

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

# Build functions
cd functions && npm run build
```

## URL Parameters

- **Upload page:** `https://your-site.web.app/upload?code=ABC123` - Reconnect to an existing session
- **Download page:** `https://your-site.web.app/download?code=ABC123` - Auto-connect with code
- **Kobo page:** `https://your-site.web.app/kobo?code=ABC123` - Auto-connect with code

## CI/CD

The project uses GitHub Actions to automatically deploy on push to `main`. See `.github/workflows/deploy.yml`.

### Set up the GitHub secret:

1. Go to [Firebase Console](https://console.firebase.google.com/) → Project Settings → Service Accounts
2. Click "Generate new private key" → Download the JSON file
3. Go to your GitHub repo → Settings → Secrets and variables → Actions
4. Click "New repository secret"
5. Name: `FIREBASE_SERVICE_ACCOUNT`
6. Value: Paste the entire JSON content from the downloaded file

## TODO

- [ ] Upgrade firebase-functions to latest version (`cd functions && npm install --save firebase-functions@latest`)
