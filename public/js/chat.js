const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const deleteRoomButton = document.querySelector(".btn-delete");

// register io as global variable
const socket = io();

// message submit
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get message text
    let msg = e.target.elements.message.value;

    msg = msg.trim();

    if (!msg) {
        return false;
    }

    // emit message to server
    socket.emit("chatMessage", msg);

    // clear input
    e.target.elements.message.value = "";
    e.target.elements.message.focus();
});

// event listener for deleting rooms
deleteRoomButton.addEventListener("click", confirmDeleteRoom);

// get message from server
socket.on("message", (message) => {
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// output message to DOM
function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
    ${message.text}
    </p>`;
    chatMessages.appendChild(div);
}

function getUrlParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);

    for (const [key, value] of searchParams.entries()) {
        params[key] = value;
    }

    return params;
}

// get URL parameters
const { room, username } = getUrlParams();

// send to server to join chatroom
socket.emit("joinRoom", { room, username });

// get room and users
socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// handle "roomDeleted" event from the server
socket.on("roomDeleted", ({ roomId }) => {
    // check if the current room being displayed is the deleted room
    if (room === roomId) {
        alert("The room has been deleted.");
        // redirect to index.html
        window.location.href = "index.html";
    }
});

// add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

function outputUsers(users) {
    userList.innerHTML = "";
    users.forEach((user) => {
        const li = document.createElement("li");
        li.innerText = user.username;
        userList.appendChild(li);
    });
}

// function to confirm delete room
function confirmDeleteRoom() {
    const confirmation = confirm("Are you sure you want to delete the room?");
    if (confirmation) {
        deleteRoom();
    }
}

// function to delete room
async function deleteRoom() {
    try {
        // get the room ID from the URL parameters
        const { room } = getUrlParams();

        // make an API request to delete the room
        await fetch(`/api/rooms/${room}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        // redirect users to the index.html page
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error deleting room:", error);
    }
}