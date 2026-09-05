export function notFound(_req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);
  const databaseUnavailable = error.code === 'P1001' || error.message?.includes("Can't reach database server");
  const status = error.statusCode ?? (databaseUnavailable ? 503 : error.code === 'P2002' ? 409 : 500);
  const message = databaseUnavailable ? 'Database unavailable. Start PostgreSQL on localhost:5432, then try again.' : status === 500 ? 'Something went wrong on the server' : error.message;
  const safeMessage = error.code === 'P2002' ? 'That record already exists' : message;
  res.status(status).json({ success: false, message: safeMessage });
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
