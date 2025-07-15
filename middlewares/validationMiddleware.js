
const sendResponse = require('../utils/responseHandler');

const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const dataToValidate = target === 'query' ? req.query : 
                          target === 'params' ? req.params : req.body;
    
    const { error } = schema.validate(dataToValidate);
    if (error) {
      const errorMessage = error.details[0].message;
      return sendResponse(res, 400, `Validation Error: ${errorMessage}`, {});
    }
    next();
  };
};

module.exports = validate;

