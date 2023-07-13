# Chat App

This is a simple chat application that allows users to join chat rooms, exchange messages in real-time, create new rooms, and delete existing rooms.

## Features

- Join existing chat rooms
- Create new chat rooms
- Real-time messaging using websockets
- Delete chat rooms

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- Knex
- Socket.IO
- HTML
- CSS
- JavaScript


## Getting Started

### Prerequisites

- Node.js
- PostgreSQL database

### Installation

1. Clone the repository:

```
git clone <https://github.com/bbocko/chat-app>
```

2. Navigate to the project directory:

```
cd chat-app
```

3. Install the dependencies:

```
npm install
```

4. Create a PostgreSQL database for the application and update the connection configuration in `server.js`.


### Usage

1. Start the server:

```
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000` to access the chat application.

3. Enter your username and select a chat room from the dropdown list.

4. Start chatting with other users in the selected chat room.

5. To create a new chat room, select "Create new room" from the dropdown list and enter the room name.

6. To delete a chat room, click the "Delete Room" button and confirm the deletion.


## API Endpoints

- GET `/api/rooms`: Retrieves all chat rooms.
- POST `/api/rooms`: Creates a new chat room.
- POST `/api/join`: Joins a chat room.
- DELETE `/api/rooms/:roomId`: Deletes a chat room.