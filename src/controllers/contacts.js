import mongoose from 'mongoose';
import { getContacts, getContactById } from '../services/contacts.js';
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

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getContact: ctrlWrapper(getContact),
};
