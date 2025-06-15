import express from 'express';
import contactsController from '../controllers/contacts.js';

const router = express.Router();

router.get('/', contactsController.getAllContacts);
router.get('/:id', contactsController.getContact);

export default router;
