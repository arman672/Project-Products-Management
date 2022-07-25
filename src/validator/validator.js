const isValidbody=function(x){
    return Object.keys(x).length>0
}


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}



const nameRegex=/^(?:([A-Za-z]+\ \1)|([A-Za-z]))+$/
const emailRegex=/^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/






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

module.exports={isValid,isValidbody,nameRegex,emailRegex}
module.exports = { isValid, isValidPassword,isValidbody,nameRegex,emailRegex } 
