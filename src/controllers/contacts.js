import mongoose from 'mongoose';
import {
  getPaginatedContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { HttpError } from '../utils/HttpError.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

const { isValidObjectId } = mongoose;

const getAllContacts = async (req, res) => {
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
  const newContact = await createContact({
    ...req.body,
    userId: req.user._id,
  });

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

  const updatedContact = await updateContact(id, req.user._id, req.body);

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

  const deletedContact = await deleteContact(id, req.user._id);

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
