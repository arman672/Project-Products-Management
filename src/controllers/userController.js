const userModel = require("../models/userModel")
const { uploadFile } = require("../utils/aws")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");

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

const loginUser =async function (req, res) {
    try {
        let data = req.body
        let {email, password} = data
        
        const foundUser = await userModel.findOne({email: email})
        if(!foundUser) return res.status(401).send({ status: false, message: "invalid credentials"})

        const isValid = await bcrypt.compare(password, foundUser.password)
        if(!foundUser || !isValid) return res.status(401).send({ status: false, message: "invalid credentials"})

        const token = await jwt.sign({ userId: foundUser._id }, "groot", { expiresIn: "1d" })
        //res.setHeader({"Authorization": "Bearer "+token});  //setting token in header

        return res.status(200).send({ status: true, message: "User login successfull", data:{userId: foundUser._id, token: token}})
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getUser =async function (req, res) {
    try {
        let id = req.params.userId
        if(!id) return res.status(400).send({ status: false, message: "id must be present in params"})

        //id validation 
        const foundUser = await userModel.findOne({_id: id})
        if(!foundUser) return res.status(404).send({ status: false, message: "user not found"})

        return res.status(200).send({ status: true, message: "User details", data:foundUser})
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { register, loginUser, getUser}
