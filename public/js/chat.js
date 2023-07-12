const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

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

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Add room name to DOM
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
