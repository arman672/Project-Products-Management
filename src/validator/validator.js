const isValid = function (value) {
    if (typeof value !== "string")   return false
    if (typeof value === 'string' && value.trim().length === 0) return false        
    return true;
};

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};

const isValidPassword = function (password) {
    password = password.trim()
    if (password.length < 8 || password.length > 15) {
        return false
    } return true
}

module.exports = { isValid, isValidRequestBody, isValidPassword } 