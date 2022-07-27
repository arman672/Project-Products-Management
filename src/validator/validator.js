//returns false in case data in body is empty
const isValidbody = function (x) {
    return Object.keys(x).length > 0
}

//check if type string and length greater then zero after trim
const isValid = function (value) {
    if (typeof value !== "string") return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
};

//password validation
const isValidPassword = function (password) {
    password = password.trim()
    if (password.length < 8 || password.length > 15) {
        return false
    } return true
}

//Ragex
const nameRegex = /^(?:([A-Za-z]+\ \1)|([A-Za-z]))+$/
const emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
const phoneRegex = /^[6-9]\d{9}$/
const objectid = /^[0-9a-fA-F]{24}$/
const alphaNumSpaceReg = /^[a-zA-Z0-9 ]+$/
const priceReg = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/

module.exports = { isValid, isValidPassword, isValidbody, nameRegex, emailRegex, objectid, phoneRegex, alphaNumSpaceReg, priceReg} 
