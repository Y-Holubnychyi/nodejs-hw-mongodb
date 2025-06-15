import mongoose from 'mongoose';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { HttpError } from '../utils/HttpError.js';

const { isValidObjectId } = mongoose;

const getAllContacts = async (req, res) => {
  const contacts = await getContacts();
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

const getContact = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new HttpError(400, 'Invalid id format');
  }

  const contact = await getContactById(id);

  if (!contact) {
    throw new HttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${id}!`,
    data: contact,
  });
};

const createContactCtrl = async (req, res) => {
  const newContact = await createContact(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

const updateContactCtrl = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new HttpError(400, 'Invalid id format');
  }

  const updatedContact = await updateContact(id, req.body);

  if (!updatedContact) {
    throw new HttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};

const deleteContactCtrl = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new HttpError(400, 'Invalid id format');
  }

  const deletedContact = await deleteContact(id);

  if (!deletedContact) {
    throw new HttpError(404, 'Contact not found');
  }

  res.status(204).send();
};

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getContact: ctrlWrapper(getContact),
  createContact: ctrlWrapper(createContactCtrl),
  updateContact: ctrlWrapper(updateContactCtrl),
  deleteContact: ctrlWrapper(deleteContactCtrl),
};
