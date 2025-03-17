# Chatter - Real-time Chat Application

A modern, real-time chat application built with Next.js, Socket.IO, and TypeScript. Features a beautiful dark theme UI and supports group chats with real-time typing indicators.


## Features

- 🔒 **Secure Authentication**
  - JWT-based authentication
  - Protected routes and API endpoints

- 💬 **Real-time Chat**
  - Instant message delivery
  - Group chat support
  - Message history
  - Typing indicators
  - Read receipts

- 👥 **Group Management**
  - Create new groups
  - Add/remove members
  - Transfer group ownership
  - Leave groups
  - Member list with roles

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark theme
  - Beautiful animations
  - Loading states
  - Toast notifications

## Tech Stack

- **Frontend**
  - Next.js 14
  - TypeScript
  - Socket.IO Client
  - Tailwind CSS
  - Radix UI Components
  - Zustand (State Management)

- **Backend Requirements**
  - Node.js server with Socket.IO
  - RESTful API endpoints
  - JWT Authentication
  - MongoDB (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API server running (default: `http://localhost:3001`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chatter-frontend.git
   cd chatter-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm run start
   ```

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_SOCKET_URL`: WebSocket server URL

## API Integration

### Authentication

The application expects the following API endpoints:

```typescript
POST /api/auth/login
POST /api/auth/register
```

### Groups

```typescript
GET /api/groups/all-member-groups
GET /api/groups/not-member-groups
POST /api/groups/create
POST /api/groups/change-owner
POST /api/groups/leave/:groupId
```

### Messages

```typescript
GET /api/messages/group/:groupId
POST /api/messages/text
```

## WebSocket Events

### Emitted Events

- `joinGroup`: When user enters a chat
- `leaveGroup`: When user leaves a chat
- `groupMessage`: When user sends a message
- `startTyping`: When user starts typing
- `stopTyping`: When user stops typing

### Listened Events

- `groupMessage`: Receive new messages
- `userTyping`: Someone started typing
- `userStoppedTyping`: Someone stopped typing

## Project Structure

```
├── app/
│   ├── components/      # Shared components
│   ├── chat/           # Chat related pages
│   ├── home/           # Home page
│   └── store/          # Global state management
├── lib/
│   ├── models/         # TypeScript interfaces
│   └── services/       # API and Socket services
├── public/             # Static assets
└── styles/            # Global styles
```

## Deployment

### Static Export (S3, Vercel, Netlify)

1. Build the static export:
   ```bash
   npm run build
   ```

2. Deploy the `out` directory to your hosting service

### Environment Setup

Make sure to configure these environment variables in your hosting platform:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Socket.IO](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

Made with ❤️ by [Your Name] 