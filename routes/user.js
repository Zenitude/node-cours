const express = require('express');
const router = express.Router();
const { getUsers, getUserById, addUser, createUser, updateUser, modifyUser, removeUser, deleteUser } = require('../controllers/users_controller');

// Create
router.get('/users/create', addUser);
router.post('/users/create/add', createUser);

// Read
router.get('/users', getUsers);

router.get('/users/:id', getUserById);

// Update
router.get('/users/:id/update', modifyUser);
router.put('/users/:id/update', updateUser);

// Delete
router.get('/users/:id/delete', removeUser);
router.delete('/users/:id/delete', deleteUser);

module.exports = router;