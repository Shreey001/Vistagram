# Vistagram

Vistagram is a modern social media platform built with React, TypeScript, Vite, and Supabase. It allows users to create posts with rich text editing, join communities, and engage with content through likes and comments.

## Features

- Rich text editing for post creation
- Community creation and management
- User authentication via Supabase
- Responsive design using Tailwind CSS
- Real-time comments and likes
- Modern UI with animations using Framer Motion

## Technologies Used

- React 19 with ES modules
- TypeScript
- Vite for bundling
- Supabase for backend and authentication
- TailwindCSS for styling
- Framer Motion for animations
- React Router v7 for routing
- React Query for data fetching
- TipTap for rich text editing

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/vistagram.git
   cd vistagram
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in your Supabase credentials in the `.env` file

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

### Automatic Deployment

1. Push your code to a GitHub repository
2. Connect your GitHub repository to Vercel
3. Add the environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings
4. Deploy

### Manual Deployment

1. Install Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

3. Deploy to Vercel:

   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `pages/` - Page components
  - `context/` - React contexts
  - `hooks/` - Custom React hooks
  - `services/` - API services
  - `styles/` - CSS styles
  - `types/` - TypeScript types
  - `utils/` - Utility functions
- `public/` - Static assets

## License

This project is licensed under the MIT License.
