const sendResponse = (res, status, message, data) => {
  res.status(status).json({
    status,
    message,
    data
  });
};

module.exports = sendResponse;
// This function is used to send a standardized response format for API requests.
