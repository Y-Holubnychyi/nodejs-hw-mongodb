import createHttpError from 'http-errors';
import {
  getPaginatedContacts,
  getContactById,
  createContact as createContactService,
  updateContact as updateContactService,
  deleteContact as deleteContactService,
} from '../services/contacts.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { processPhotoUpload } from '../utils/processPhotoUpload.js';

export const getAllContacts = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const order = sortOrder === 'desc' ? -1 : 1;

  const filterFromQuery = parseFilterParams(req.query);
  const filter = {
    ...filterFromQuery,
    userId: req.user._id,
  };

  if (typeof req.query.isFavourite !== 'undefined') {
    filter.isFavourite = req.query.isFavourite === 'true';
  }

  if (req.query.contactType) {
    filter.contactType = req.query.contactType;
  }

  const { contacts, totalItems } = await getPaginatedContacts(page, perPage, {
    sortBy,
    order,
    filter,
  });

  const paginationData = calculatePaginationData(totalItems, perPage, page);

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts,
      ...paginationData,
    },
  });
};

export const getContact = async (req, res) => {
  const { id } = req.params;

  const contact = await getContactById(id, req.user._id);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${id}!`,
    data: contact,
  });
};

export const createContact = async (req, res) => {
  const photoUrl = req.file ? await processPhotoUpload(req.file) : null;

  const contactData = {
    ...req.body,
    userId: req.user._id,
    photo: photoUrl,
  };

  const newContact = await createContactService(contactData);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const updateContact = async (req, res) => {
  const { id } = req.params;

  if (req.file) {
    const photoUrl = await processPhotoUpload(req.file);
    req.body.photo = photoUrl;
  }

  const updatedContact = await updateContactService(id, req.user._id, req.body);

  if (!updatedContact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};

export const deleteContact = async (req, res) => {
  const { id } = req.params;

  const deletedContact = await deleteContactService(id, req.user._id);

  if (!deletedContact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
};
