import express from 'express';
import contactsController from '../controllers/contacts.js';

const router = express.Router();

router.get('/', contactsController.getAllContacts);
router.get('/:id', contactsController.getContact);
router.post('/', contactsController.createContact);
router.patch('/:id', contactsController.updateContact);
router.delete('/:id', contactsController.deleteContact);

export default router;
