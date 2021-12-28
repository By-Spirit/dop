const createBtn = document.getElementById('CreateRoomBtn');
const form = document.getElementById('join-form');
const room = document.getElementById('room');

const roomList = document.getElementById('room');

const socket = io();

socket.emit('joinLobby');

socket.on('roomList', (roomArray) => {
    roomList.innerHTML = `${roomArray.map(room => `<option value="${room}">${room}</option>`).join('')}`;
    $('#room option:last').prop('selected', true);
});

createBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const name = prompt('Введите название для новой комнаты');
    if (name) {
        socket.emit('createNewRoom', (name));
    }
});

// form.addEventListener('submit', (e)=>{ // подтверждение входа в комнату (submit в форме)
//     e.preventDefault();
//     socket.emit('userJoined', (room.value));
//     form.submit()
// });
