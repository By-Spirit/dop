const rooms = [];

// Create new room
function createNewRoom(room) {
    rooms.push(room);
    return room;
}
// Delete room
function deleteRoom(room) {
    const index = rooms.findIndex(room => room === room);

    if(index !== -1){
        return rooms.splice(index, 1)[0];
    }
}

function getRooms() {
    return rooms;
}

module.exports = {
    createNewRoom,
    deleteRoom,
    getRooms
};