const userModel = require("../models/userModel")
const {uploadFile}=require("../utils/aws")

const mongoose = require("mongoose")
const bcrypt=require("bcrypt")
  

const register = async function (req, res) {
    try {
        let data = req.body
        let { fname, lname, email, phone, password, address } = data
        let files = req.files


        if (!(files && files.length)) {
            return res.status(400).send({ status: false, message: " Please Provide The Profile Image" });
        }

        const uploadedProfileImage = await uploadFile(files[0])
        password = await bcrypt.hash(password, 10);
        data.password=password
        data.profileImage=uploadedProfileImage
       
        return res.status(201).send({ status: true, data: data })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
    //password = await bcrypt.hash(password, 10)
}

//===========================================================get user
const userLogin = async function(req,res){
    try {
       const {email, password} = req.body

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = { register }
