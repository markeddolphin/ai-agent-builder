import express from 'express';
import { UserController } from '../controllers/userController.js';

const router = express.Router();

// create new user
router.post('/', UserController.create);

// create confirmed user
router.post('/confirmed', UserController.createConfirmedUser);

// check email confirmation
router.get('/check-email/:email', UserController.checkEmailConfirmation);

// get user by id
router.get('/:id', UserController.getById);

// update user
router.put('/:id', UserController.update);

export default router; 