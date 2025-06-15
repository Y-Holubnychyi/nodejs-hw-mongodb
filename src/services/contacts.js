import ContactCollection from '../db/models/contacts.js';

export const getContacts = () => ContactCollection.find();

export const getContactById = (id) => ContactCollection.findById(id);

export const createContact = (data) => ContactCollection.create(data);

export const updateContact = (id, data) =>
  ContactCollection.findByIdAndUpdate(id, data, { new: true });

export const deleteContact = async (id) => {
  const deleted = await ContactCollection.findByIdAndDelete(id);
  return deleted;
};
