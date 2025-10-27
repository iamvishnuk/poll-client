# Poll Website - Client

A modern, responsive React-based polling application built with Next.js and TypeScript. This client provides a beautiful interface for creating, viewing, and interacting with polls in real-time.

## Features

- 🎯 Create and manage polls
- 📊 Real-time voting with WebSocket integration
- 🎨 Modern UI with Radix UI components and Tailwind CSS
- 📱 Fully responsive design
- 🔍 Form validation with React Hook Form and Zod
- ⚡ Fast and optimized with Next.js 16
- 🌙 Dark/Light theme support

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Real-time**: WebSocket
- **Icons**: Lucide React

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 22.12.0 or higher)
- **pnpm** (recommended) or npm/yarn
- **Docker** (optional, for containerized setup)

## 🚀 Quick Start

### Option 1: Local Development (Without Docker)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd poll-website/poll-client
   ```

2. **Install dependencies**

   ```bash
   # Using pnpm (recommended)
   pnpm install

   # Or using npm
   npm install

   # Or using yarn
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

   Configure your environment variables:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

4. **Start the development server**

   ```bash
   # Using pnpm
   pnpm dev

   # Or using npm
   npm run dev

   # Or using yarn
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Option 2: Docker Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd poll-website/poll-client
   ```

2. **Environment Setup**
   Create a `.env.production` file:

   ```bash
   cp .env.example .env.production
   ```

   Configure for Docker environment:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

3. **Build and run with Docker Compose**

   ```bash
   docker compose up --build
   ```

4. **Access the application**
   The client will be available at [http://localhost:7000](http://localhost:7000)
