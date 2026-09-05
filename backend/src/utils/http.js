export function fail(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function pagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export function paged(data, total, page, limit) {
  return {
    items: data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
