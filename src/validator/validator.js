const isValidbody = function (x) {
    return Object.keys(x).length > 0
}



const isValid = function (value) {
    if (typeof value !== "string") return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
};




const isValidPassword = function (password) {
    password = password.trim()
    if (password.length < 8 || password.length > 15) {
        return false
    } return true
}
const nameRegex = /^(?:([A-Za-z]+\ \1)|([A-Za-z]))+$/
const emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
const phoneRegex = /^[6-9]\d{9}$/
const objectid = /^[0-9a-fA-F]{24}$/

module.exports = { isValid, isValidPassword, isValidbody, nameRegex, emailRegex, objectid, phoneRegex } 
