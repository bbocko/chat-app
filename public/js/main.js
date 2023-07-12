const joinForm = document.getElementById("joinForm");
const roomSelect = document.getElementById("room");
const newRoomInputContainer = document.getElementById("newRoomInputContainer");
const newRoomInput = document.getElementById("new-room");
const usernameInput = document.getElementById("usernameInput");

// register io as global variable
const socket = io();

joinForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const selectedRoom = roomSelect.value;
    const newRoomName = newRoomInput.value.trim();

    if (selectedRoom === "new-room" && newRoomName !== "") {
        // create a new room
        createRoom(newRoomName, username);
    } else if (selectedRoom !== "new-room") {
        // join an existing room
        joinRoom(selectedRoom, username);
    }
});

roomSelect.addEventListener("change", () => {
    const selectedOption = roomSelect.value;

    if (selectedOption === "new-room") {
        newRoomInputContainer.style.display = "block";
    } else {
        newRoomInputContainer.style.display = "none";
    }
});

// function for making post API request
function createRoom(roomName) {
    try {
        fetch("http://localhost:3000/api/rooms", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "roomName": roomName
            })
        })
            // listen for new room event from server
            .then(
                socket.on('newRoom', (newRoom) => {
                    // append the new room to the room select element
                    const option = document.createElement('option');
                    option.value = newRoom.id;
                    option.textContent = newRoom.name;
                    roomSelect.appendChild(option);
                }));
    } catch (error) {
        console.error('Error creating new room:', error);
    }
}

// catch message on client side
socket.on("message", message => {
    console.log(message);
})