const allowedSortFields = [
  '_id',
  'name',
  'email',
  'phoneNumber',
  'createdAt',
  'updatedAt',
];
const allowedSortOrders = ['asc', 'desc'];

export const parseSortParams = ({ sortBy, sortOrder }) => {
  const parsedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const parsedSortOrder = allowedSortOrders.includes(sortOrder)
    ? sortOrder
    : 'asc';

  return {
    sortBy: parsedSortBy,
    sortOrder: parsedSortOrder,
  };
};
