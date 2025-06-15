import express from 'express';
import { getAllContacts, getContact } from '../controllers/contacts.js';

const router = express.Router();

router.get('/', getAllContacts);
router.get('/:id', getContact);

export default router;
