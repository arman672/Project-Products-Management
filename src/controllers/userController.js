const userModel = require("../models/userModel")
//const moongoose=require("mongoose")
const { uploadFile } = require("../utils/aws")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { isValid, isValidbody, nameRegex, emailRegex, isValidPassword, objectid, phoneRegex } = require("../validator/validator")





const register = async function (req, res) {
    try {
        let data = req.body
        if (!isValidbody(data)) {
            return res.status(400).send({ status: false, msg: "plz enter some keys and values in the data" })
        }
        let { fname, lname, email, phone, password, address } = data



        //****************************************************NAME VALIDATION*******************************************************************************/



        if (!isValid(fname)) {
            return res.status(400).send({ status: false, msg: "plz enter your firstName" })

        }
        if (!nameRegex.test(fname)) {
            return res.status(400)
                .send({ status: false, msg: "plz do not use number in naming credential,only alphabets is required in naming credential" })
        }

        if (!isValid(lname)) {
            res.status(400).send({ status: "false", msg: "plz enter your lastName" })

        }
        if (!nameRegex.test(lname)) {
            return res.status(400)
                .send({ status: false, msg: "plz do not use number in naming credential,only alphabets is required in naming credential" })
        }


        //******************************************************EMAIL VALIDATION************************************************************ */        
        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "plz enter the emailId" })

        }
        if (!emailRegex.test(email)) {
            return res.status(400).send({ status: false, msg: "enter the valid emailId" })
        }

        let emailCheck = await userModel.findOne({ email: email })
        if (emailCheck) {
            return res.status(400).send({ status: false, msg: "emailId is already in use" })

        }


        //***************************************************************************PHONE VALIDATION********************************************************* */


        if (!isValid(phone)) {
            return res.status(400).send({ status: false, msg: "plz enter phone number" })
        }

        if (!phoneRegex.test(phone)) {
            return res.status(400).send({ status: false, msg: "plz enter valid phoneNumber" })
        }

        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, msg: "password should be more than 8 characters or less than 15 characters" })
        }
        let phoneCheck = await userModel.findOne({ phone: phone })
        if (phoneCheck) {
            return res.status(400).send({ status: false, msg: "phone number is already in use" })

        }



        //*********************************************************ADDRESS VALIDATION***************************************************************** */
        
        
        address = JSON.parse(address)
        
        
        
        if (address) {
            if (typeof address != "object") return res.status(400).send({ status: false, message: "address is in incorrect format" })

            if (address.shipping) {
                if (address.shipping.street) {
                    if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "shipping street is in incorrect format" })

                } else return res.status(400).send({ status: false, msg: "address.shipping.street is required" })

                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "shipping city is in incorrect format" })
                } else return res.status(400).send({ status: false, msg: "address.shipping.city is required" })
                if (address.shipping.pincode) {
                    if (typeof address.shipping.pincode != "number") return res.status(400).send({ status: false, message: "shipping pincode is in incorrect format" })
                } else return res.status(400).send({ status: false, msg: "address.shipping.pincode is required" })

            } else return res.status(400).send({ status: false, msg: "address.shipping is required" })
            if (address.billing) {
                if (address.billing.street) {
                    if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: "billing street is in incorrect format" })
                } else return res.status(400).send({ status: false, msg: "address.billing.street is required" })

                if (address.billing.city) {
                    if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: "billing city is in incorrect format" })
                } else return res.status(400).send({ status: false, msg: "address.billing.city is required" })


                if (address.billing.pincode) {
                    if (typeof address.billing.pincode != "number") return res.status(400).send({ status: false, message: "billing pincode is in incorrect format" })
                }

                else return res.status(400).send({ status: false, msg: "address.billing.pincode is required" })

            } else return res.status(400).send({ status: false, msg: "address.billing is required" })


            //********************************************************************************************************************************** */
            let files = req.files

            if (!(files && files.length)) {
                return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
            }

            const uploadedProfileImage = await uploadFile(files[0])
            password = await bcrypt.hash(password, 10);
            data.password = password
            data.profileImage = uploadedProfileImage
            data.address = address


            let createdUser = await userModel.create(data)

            return res.status(201).send({ status: true, message: "User created successsfully", data: createdUser })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const loginUser = async function (req, res) {
    try {
        let data = req.body
        let { email, password } = data

        if (!isValidbody(data)) return res.status(400).send({ status: false, message: "email and password cannot be empty" })
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email should be in string format and it cannot be empty"})
        if (!email.match(emailRegex)) return res.status(400).send({ status: false, message: "email is in incorrect format" })

        if (!isValid(password)) return res.status(400).send({ status: false, message: "password should be in string format and it cannot be empty" })
        //if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password should be 8-15 characters in length." })

        const foundUser = await userModel.findOne({ email: email })
        if (!foundUser) return res.status(401).send({ status: false, message: "invalid credentials" })

        const cmprPassword = await bcrypt.compare(password, foundUser.password)
        if (!foundUser || !cmprPassword) return res.status(401).send({ status: false, message: "invalid credentials" })

        const token = await jwt.sign({ userId: foundUser._id }, "groot", { expiresIn: "1d" })
        //res.setHeader({"Authorization": "Bearer "+token});  //setting token in header

        return res.status(200).send({ status: true, message: "User login successfull", data: { userId: foundUser._id, token: token } })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body

        if (!userId) return res.status(400).send({ status: false, message: "Please provide userId" })
        if (!isValid(userId)) return res.status(400).send({ status: false, message: "Incorrect userId" })
        if (!userId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect userId" })

        let user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, message: "User not found" })

        if(req.token.userId != userId)  return res.status(403).send({status : false, message : "Not Authorised"})
        
        if (!isValidbody(data) && !req.files) return res.status(400).send({ status: false, message: "Please provide data to update" })

        let { fname, lname, email, phone, password, address } = data
        if (fname) {
            if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname is in incorrect format" })
            if (!fname.match(nameRegex)) return res.status(400).send({ status: false, message: "fname is in incorrect format" })
        }
        if (lname) {
            if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is in incorrect format" })
            if (!lname.match(nameRegex)) return res.status(400).send({ status: false, message: "lname is in incorrect format" })
        }
        if (email) {
            if (!isValid(email)) return res.status(400).send({ status: false, message: "email is in incorrect format" })
            if (!email.match(emailRegex)) return res.status(400).send({ status: false, message: "email is in incorrect format" })
            let user = await userModel.findOne({ email })
            if (user) return res.status(400).send({ status: false, message: "email already used" })
        }
        if (phone) {
            if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone is in incorrect format" })
            if (!phone.match(phoneRegex)) return res.status(400).send({ status: false, message: "phone is in incorrect format" })
            let user = await userModel.findOne({ phone })
            if (user) return res.status(400).send({ status: false, message: "phone already used" })
        }
        if (password) {
            if (!isValid(password)) return res.status(400).send({ status: false, message: "password is in incorrect format" })
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password should be 8-15 characters in length." })
            data.password = await bcrypt.hash(password, 10);
        }
        let query = {}
        if (address) {
            address = JSON.parse(address)
            if (typeof address != "object") return res.status(400).send({ status: false, message: "address is in incorrect format" })
            if (address.shipping) {
                if (address.shipping.street) {
                    if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "shipping street is in incorrect format" })
                    query["address.shipping.street"] = address.shipping.street
                }
                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "shipping city is in incorrect format" })
                    query["address.shipping.city"] = address.shipping.city
                }
                if (address.shipping.pincode) {
                    if (typeof address.shipping.pincode != "number") return res.status(400).send({ status: false, message: "shipping pincode is in incorrect format" })
                    query["address.shipping.pincode"] = address.shipping.pincode
                }
            }
            if (address.billing) {
                if (address.billing.street) {
                    if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: "billing street is in incorrect format" })
                    query["address.billing.street"] = address.billing.street
                }
                if (address.billing.city) {
                    if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: "billing city is in incorrect format" })
                    query["address.billing.city"] = address.billing.city
                }
                if (address.billing.pincode) {
                    if (typeof address.billing.pincode != "number") return res.status(400).send({ status: false, message: "billing pincode is in incorrect format" })
                    query["address.billing.pincode"] = address.billing.pincode
                }
            }
            delete data.address
        }

        if(req.files) {
            let image = req.files[0]
            if(image) {
                let url = await uploadFile(image)
                data.profileImage = url
            }
        }

        let updatedUser = await userModel.findOneAndUpdate({ _id: userId }, { ...data, ...query }, { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getUser = async function (req, res) {
    try {
        let id = req.params.userId   
        if (!id) return res.status(400).send({ status: false, message: "id must be present in params" })
        if (!id.match(objectid)) return res.status(400).send({ status: false, message: "invalid userId" })

        const foundUser = await userModel.findOne({ _id: id })
        if (!foundUser) return res.status(404).send({ status: false, message: "user not found" })

        return res.status(200).send({ status: true, message: "User details", data: foundUser })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { register, loginUser, getUser, updateUser }
