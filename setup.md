# Setup

## Prerequisites

1. Node.js version 18.17.0 or later
2. npm version 9.0.0 or later

## Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd bidding-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Firebase configuration:
```plaintext
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Set up Firebase:
   - Create a new project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication
   - Deploy the Firestore security rules

5. Run the development server:
```bash
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000)

## Project Structure

```plaintext
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable components
├── lib/                 # Firebase and utility functions
└── types/              # TypeScript interfaces
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

