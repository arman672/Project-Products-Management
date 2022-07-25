const userModel = require("../models/userModel")
const { uploadFile } = require("../utils/aws")
const bcrypt = require("bcrypt")

const register = async function (req, res) {
    try {
        let data = req.body
        let { fname, lname, email, phone, password, address } = data
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

const updateUser = function (req, res) {
    try {

    } catch (error) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { register }