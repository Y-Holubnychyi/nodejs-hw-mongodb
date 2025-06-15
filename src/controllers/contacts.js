// src/controllers/contacts.js
import { getContacts, getContactById } from '../services/contacts.js';

export const getAllContacts = async (req, res) => {
  const contacts = await getContacts();
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContact = async (req, res) => {
  const { id } = req.params;
  const contact = await getContactById(id);

  if (!contact) {
    return res.status(404).json({
      status: 404,
      message: 'Contact not found',
    });
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${id}!`,
    data: contact,
  });
};
