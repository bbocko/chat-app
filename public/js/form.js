const joinForm = document.getElementById("joinForm");
const roomSelect = document.getElementById("room");
const newRoomInputContainer = document.getElementById("newRoomInputContainer");
const newRoomInput = document.getElementById("new-room");
const usernameInput = document.getElementById("usernameInput");

// fetch chat rooms from server-side API
fetchRooms();

joinForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const selectedRoom = roomSelect.value;
    const newRoomName = newRoomInput.value.trim();

    if (selectedRoom === 'new-room' && newRoomName !== '') {
        // create a new room
        createRoom(newRoomName);
    } else {
        // join existing room
        joinRoom(selectedRoom, username);
    }
});

roomSelect.addEventListener('change', () => {
    const selectedOption = roomSelect.value;
    const joinButton = document.getElementById('joinButton');

    if (selectedOption === 'new-room') {
        newRoomInputContainer.style.display = 'block';
        joinButton.textContent = 'Create new room';
    } else {
        newRoomInputContainer.style.display = 'none';
        joinButton.textContent = 'Join Chat';
    }
});

// function for creating new room
async function createRoom(roomName) {
    try {
        const response = await fetch("http://localhost:3000/api/rooms", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                roomName: roomName
            })
        });

        if (response.ok) {
            const newRoom = await response.json();

            // append the new room to the room select element
            const option = document.createElement('option');
            option.value = newRoom[0].id; // access the id property
            option.textContent = newRoom[0].name; // access the name property
            roomSelect.appendChild(option);

            // clear the input field
            newRoomInput.value = '';
        } else {
            console.error('Failed to create new room:', response.status);
        }
    } catch (error) {
        console.error('Error creating new room:', error);
    }
}

// function for joining a room
async function joinRoom(roomId, username) {
    try {
        const response = await fetch('/api/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roomId,
                username
            })
        });

        if (response.ok) {
            // redirect to the chat.html page with the room ID and username
            window.location.href = `chat.html?room=${roomId}&username=${username}`;
        } else {
            console.error('Failed to join room:', response.status);
        }
    } catch (error) {
        console.error('Error joining room:', error);
    }
}

// function for fetching all rooms
async function fetchRooms() {
    try {
        const response = await fetch('/api/rooms');
        const rooms = await response.json();

        // sort the rooms by id
        rooms.sort((a, b) => a.id - b.id);

        // populate the room select element with options
        for (const room of rooms) {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            roomSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error fetching chat rooms:', error);
    }
}
