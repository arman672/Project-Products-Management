const userModel = require("../models/userModel")
const { uploadFile } = require("../utils/aws")
const bcrypt = require("bcrypt")
const { isValid, isValidbody, nameRegex,emailRegex } = require("../validator/validator")


const register = async function (req, res) {
    try {
        let data = req.body
        if (!isValidbody(data)) {
            return res.status(400).send({ status: false, msg: "plz enter some keys and values in the data" })
        }
        let { fname, lname, email, phone, password, address } = data



//****************************************************NAME VALIDATION*******************************************************************************/



        if (!isValid(fname)) {
            res.status(400).send({ status: false, msg: "plz enter your firstName" })

        }
        if (!nameRegex.test(fname)) {
            return res.status(400)
                .send({ status: false, msg: "plz enter the valid name: plz do not use number in naming credential,only alphabets is required in naming credential" })
        }

        if (!isValid(lname)) {
            res.status(400).send({ status: "false", msg: "plz enter your lastName" })

        }
        if (!nameRegex.test(lname)) {
            return res.status(400)
                .send({ status: false, msg: "plz enter the valid name: plz do not use number in naming credential,only alphabets is required in naming credential" })
        }


//******************************************************EMAIL VALIDATION************************************************************ */        

        

             if(!isValid(email)){
                return res.status(400).send({data:false,msg:"plz enter your emaidId"})
             }
             if(!emailRegex.test(email)){
                return res.status(400).send({data:false,msg:"invalid emailId"})

             }
             
             










//********************************************************************************************************************************** */
        let files = req.files

        if (!(files && files.length)) {
            return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
        }

        const uploadedProfileImage = await uploadFile(files[0])
        password = await bcrypt.hash(password, 10);
        data.password = password
        data.profileImage = uploadedProfileImage
        data.address = JSON.parse(address)

        let createdUser = await userModel.create(data)

        return res.status(201).send({ status: true, message: "User created successsfully", data: createdUser })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
}


module.exports = { register }