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

Open [game.smaffan.com](https://www.game.smaffan.com) with your browser to see the result.

## Controls

- **W / ↑ / Click**: Move forward
- **S / ↓ / R-Click**: Move backward
- **Mouse**: Look around
- **Enter / Click**: Select / Exit chamber
- **H**: Open help menu
- **\\**: Toggle fullscreen
- **L**: Lock/unlock camera (debug)

## Important: Large Asset Files

This project contains large 3D model files and audio files that are excluded from git:
- `/public/models/*` - 3D model files (gitignored)
- `/public/audio/*` - Audio files (gitignored)

These files are hosted separately using Cloudflare R2.

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
