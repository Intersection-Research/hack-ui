# Agent Chat UI

A very basic chat interface for testing your agents during hackathon development. 

WARNING: This UI was put together in a few hours and probably has bugs. When you have completed your agents they will be made available on a more complete public platform.

NOTE: If you are having issues with this UI, please reach out to one of the hackathon organizers. Also note that if you would like your agent to have a capability this UI doesn't support feel free to reach out to us and we can determine if it's something we'll implement to provide support for your agent!


## Overview

This is a standalone React application designed to provide a simple chat interface for interacting with AI agents running locally on your machine. The interface connects to your local agent server running on port 8000, sending messages and displaying responses.

## Features

- Clean, minimal chat UI
- Connects to your local agent on `localhost:8000`
- No authentication required
- Supports SSE streaming responses
- Dark mode support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Access the chat UI at:
```
http://localhost:5173
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory and can be deployed to any static hosting service.

## Connecting to Your Agent

This UI is designed to connect to a local agent server running on `localhost:8000`. 

Your agent should expose an API endpoint at `/assist` that accepts POST requests with the following structure:

```json
{
  "query": {
    "id": "01JQETZTSNT4KC0TRS6EBN32TG",  // Must be valid ULID format
    "prompt": "Your message text"
  },
  "session": {
    "processor_id": "test-processor",
    "activity_id": "01JR8SXE9B92YDKKNMYHYFZY1T",  // Must be valid ULID format
    "request_id": "01JR8SY5PHB9X2FET1QRXGZW76",  // Must be valid ULID format
    "interactions": []
  }
}
```

The response from your agent should be in JSON format with one of these patterns:

1. For simple JSON responses:
```json
{
  "content": "Your agent's response text"
}
```

2. For Server-Sent Events (SSE):
```
event: FINAL_RESPONSE
data: {"content": "Your agent's response text"}

event: done
data: {}
```

## Customizing

To customize the hardcoded agent name and description, edit the `context.jsx` file:

```jsx
// Hardcoded agent info
const [agent, setSelectedAgent] = useState({
  name: "Your Agent Name Here",
  description: "Your agent description here",
  _id: "local-agent"
});
```

## Development

This application is built with:
- React
- Vite
- TailwindCSS
- ULID for ID generation
