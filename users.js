const users = []

const addUsers = ({ id, name, room }) => {

    const Name = name.trim().toLowerCase();
    const Room = room.trim().toLowerCase();

    const existingUser = users.find((user) => user.room === Room && user.name === Name)

    if (existingUser) {
        return { error: 'Username is already in use!' }
    }

    const user = { id, room: Room, name: Name }

    users.push(user)

    return { user }
}

const removeUsers = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => users.find((user) => user.id === id)

const getUsersInRoom = (room) => users.filter((user) => user.room === room)

module.exports = { addUsers, removeUsers, getUser, getUsersInRoom };