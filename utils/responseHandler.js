// responseHandler.js
const sendResponse = (res, status, message, data) => {
  res.status(status).json({
    status,
    message,
    data
  });
};

module.exports = sendResponse;