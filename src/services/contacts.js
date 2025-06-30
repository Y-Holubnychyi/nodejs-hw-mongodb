import Contact from '../db/models/contacts.js';

export const getPaginatedContacts = async (
  page = 1,
  perPage = 10,
  options = {},
) => {
  const { sortBy = 'name', order = 1, filter = {} } = options;

  const skip = (page - 1) * perPage;

  const contacts = await Contact.find(filter)
    .sort({ [sortBy]: order })
    .skip(skip)
    .limit(perPage);

  const totalItems = await Contact.countDocuments(filter);

  return { contacts, totalItems };
};

export const getContactById = async (id) => {
  return Contact.findById(id);
};

export const createContact = async (data) => {
  return Contact.create(data);
};

export const updateContact = async (id, userId, data) => {
  return Contact.findOneAndUpdate({ _id: id, userId }, data, { new: true });
};

export const deleteContact = async (id, userId) => {
  return Contact.findOneAndDelete({ _id: id, userId });
};
