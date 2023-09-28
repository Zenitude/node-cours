const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/users_controller');

router.post('/users/create', createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/update', updateUser);
router.delete('/users/:id/delete', deleteUser);

module.exports = router;