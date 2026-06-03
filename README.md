# Dark Tunnel Portfolio

An immersive 3D portfolio experience built with Next.js, Three.js, and React Three Fiber. Navigate through a dark tunnel, explore different paths, and discover chambers with interactive content.

## Features

- **3D Navigation**: Ride through a procedurally generated dark tunnel
- **Branching Paths**: Explore different career paths at each junction
- **Interactive Chambers**: View detailed content in 3D chambers
- **Audio Experience**: Dynamic background music and sound effects
- **Camera Controls**: Free camera movement with mouse
- **Fullscreen Mode**: Toggle fullscreen for immersive experience
- **Settings Panel**: Customize graphics quality and audio settings

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Controls

- **W / ↑ / Click**: Move forward
- **S / ↓ / R-Click**: Move backward
- **Mouse**: Look around
- **Enter / Click**: Select / Exit chamber
- **H**: Open help menu
- **\\**: Toggle fullscreen
- **L**: Lock/unlock camera (debug)

## Deployment

### Important: Large Asset Files

This project contains large 3D model files and audio files that are excluded from git:
- `/public/models/*` - 3D model files (gitignored)
- `/public/audio/*` - Audio files (gitignored)

These files must be hosted separately using Cloudflare R2. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on setting up R2 and uploading assets.

### Deploy on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on push

The project includes a `vercel.json` configuration for optimal deployment settings.

### Deployment Configuration

- `vercel.json` - Vercel deployment settings
- `DEPLOYMENT.md` - Comprehensive deployment guide with R2 asset storage setup

## Tech Stack

- **Framework**: Next.js 16
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Post-processing**: React Three Postprocessing
- **Physics**: React Three Rapier
- **Audio**: Howler.js
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Animations**: GSAP

## Project Structure

- `src/components/` - React components (Chamber, Cart, AudioManager, etc.)
- `src/lib/` - Utility functions and configurations
- `src/store/` - Zustand state management
- `src/hooks/` - Custom React hooks
- `public/models/` - 3D model files (gitignored)
- `public/audio/` - Audio files (gitignored)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Howler.js Documentation](https://howlerjs.com/)
