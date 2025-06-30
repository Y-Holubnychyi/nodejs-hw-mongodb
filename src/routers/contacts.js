import express from 'express';
import contactsController from '../controllers/contacts.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', ctrlWrapper(contactsController.getAllContacts));
router.get('/:id', isValidId, ctrlWrapper(contactsController.getContact));
router.post(
  '/',
  validateBody(createContactSchema),
  ctrlWrapper(contactsController.createContact),
);

router.patch(
  '/:id',
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(contactsController.updateContact),
);

router.delete('/:id', isValidId, ctrlWrapper(contactsController.deleteContact));

export default router;
