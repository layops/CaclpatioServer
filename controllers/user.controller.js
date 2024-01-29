const User = require('../models/user.model');
//const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const normalize = require("../helper/normalize");

const mandatoryMaterials = [
    "Cam-90-193",
    "Cam-90-198",
    "Cam-90-203",
    "Cam-90-208",
    "Cam-90-213",
    "Cam-90-218",
    "Cam-90-223",
    "Cam-90-228",
    "Cam-90-233",
    "Cam-90-238",
    "Cam-98-193",
    "Cam-98-198",
    "Cam-98-203",
    "Cam-98-208",
    "Cam-98-213",
    "Cam-98-218",
    "Cam-98-223",
    "Cam-98-228",
    "Cam-98-233",
    "Cam-98-238",
    "Cam-103-193",
    "Cam-103-198",
    "Cam-103-203",
    "Cam-103-208",
    "Cam-103-213",
    "Cam-103-218",
    "Cam-103-223",
    "Cam-103-228",
    "Cam-103-233",
    "Cam-103-238",
    "2033",
    "2034",
    "2035",
    "1861",
    "2039",
    "2040",
    "2041",
    "1862",
    "2036",
    "2037",
    "2038",
    "1864",
    "2042",
    "2077",
    "Goot-7016-4m",
    "Goot-7016-5m",
    "Goot-7016-6m",
    "Goot-7016-7m",
    "Goot-7016-8m",
    "Goot-7016-9m",
    "Goot-7016-10m",
    "Goot-9001-4m",
    "Goot-9001-5m",
    "Goot-9001-6m",
    "Goot-9001-7m",
    "Goot-9001-8m",
    "Goot-9001-9m",
    "Goot-9001-10m",
    "Goot-9005-4m",
    "Goot-9005-5m",
    "Goot-9005-6m",
    "Goot-9005-7m",
    "Goot-9005-8m",
    "Goot-9005-9m",
    "Goot-9005-10m",
    "Muurplaat-7016-4m",
    "Muurplaat-7016-5m",
    "Muurplaat-7016-6m",
    "Muurplaat-7016-7m",
    "Muurplaat-7016-8m",
    "Muurplaat-7016-9m",
    "Muurplaat-7016-10m",
    "Muurplaat-9001-4m",
    "Muurplaat-9001-5m",
    "Muurplaat-9001-6m",
    "Muurplaat-9001-7m",
    "Muurplaat-9001-8m",
    "Muurplaat-9001-9m",
    "Muurplaat-9001-10m",
    "Muurplaat-9005-4m",
    "Muurplaat-9005-5m",
    "Muurplaat-9005-6m",
    "Muurplaat-9005-7m",
    "Muurplaat-9005-8m",
    "Muurplaat-9005-9m",
    "Muurplaat-9005-10m",
    "Ligger-7016-4m",
    "Ligger-7016-5m",
    "Ligger-7016-6m",
    "Ligger-7016-7m",
    "Ligger-7016-8m",
    "Ligger-7016-9m",
    "Ligger-7016-10m",
    "Ligger-9001-4m",
    "Ligger-9001-5m",
    "Ligger-9001-6m",
    "Ligger-9001-7m",
    "Ligger-9001-8m",
    "Ligger-9001-9m",
    "Ligger-9001-10m",
    "Ligger-9005-4m",
    "Ligger-9005-5m",
    "Ligger-9005-6m",
    "Ligger-9005-7m",
    "Ligger-9005-8m",
    "Ligger-9005-9m",
    "Ligger-9005-10m",
    "Üst Orta Kapak-7016",
    "Üst Orta Kapak-9001",
    "Üst Orta Kapak-9005",
    "Üst Yan Kapak-7016",
    "Üst Yan Kapak-9001",
    "Üst Yan Kapak-9005",
    "Sierklick-7016",
    "Sierklick-9001",
    "Sierklick-9005",
    "Polycarbon-opaal",
    "Polycarbon-helder",
    "Ayak-7016",
    "Ayak-9001",
    "Ayak-9005",
    "Ayak Kapak-7016",
    "Ayak Kapak-9001",
    "Ayak Kapak-9005",
    "Oluk Kapak-7016",
    "Oluk Kapak-9001",
    "Oluk Kapak-9005",
    "Muur Kapak-7016",
    "Muur Kapak-9001",
    "Muur Kapak-9005",
    "4.2x19 Boyalı Vida-7016",
    "4.2x19 Boyalı Vida-9001",
    "4.2x19 Boyalı Vida-9005",
    "Ligger Civatası-7016",
    "Ligger Civatası-9001",
    "Ligger Civatası-9005",
    "Glass",
    "Muur Civatası",
    "Süzgeç",
    "Slikon",
    "Duvar Lastiği",
];


const postLogin = (req, res) => {
    try {
        const {username, password} = req.body;
        if (!username || !password)
            return res.status(400).json({message: "Please fill all fields."});

        User.findOne({username: username, password: password})
            .then(exist => {
                if (!exist)
                    return res.status(401).json({message: "username or password incorrect"});

                //if (bcrypt.compareSync(password, exist.password)) {
                let token = jwt.sign({
                    _id: exist._id,
                    username: exist.username,
                    nameSurname: exist.nameSurname
                }, process.env.JWT_TOKEN);
                return res.status(200).json({token});
                /*} else {
                    return res.status(401).json({message: "username or password incorrect"});
                }*/
            });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
};

const postRegister = (req, res) => {
    try {
        const {username, password, nameSurname, secretPassword} = req.body;
        if (!username || !password || !nameSurname || !secretPassword)
            return res.status(404).json({message: "Eksik alanları doldurunuz"});

        if (process.env.SECRET_PASSWORD !== secretPassword)
            return res.status(500).json({message: "Yetkisiz!"});

        User.findOne({username: username})
            .then(exist => {
                if (exist)
                    return res.status(400).json({message: username + " username already exist"});

                const user = new User({
                    username: username,
                    password: password, //bcrypt.hashSync(password, 8),
                    nameSurname: nameSurname
                });

                mandatoryMaterials.forEach(value => {
                    user.stock.push({name: value, count: 0});
                });

                user.save()
                    .then(result => {
                        res.status(201).json(result);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({message: err.message});
                    });
            });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
};

const postUpdatePassword = (req, res) => {
    try {
        const {currentPassword, newPassword} = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({message: "Please fill all fields."});

        const userId = mongoose.Types.ObjectId(req.user._id);
        User.findById(userId, (err, user) => {
            if (err) {
                res.status(500).json({message: err.message});
            } else if (!user) {
                res.status(404).json({message: "User not found"});
            } else {
                if (user.password !== currentPassword) {
                    res.status(400).json({message: "Current password incorrect."})
                } else {
                    user.password = newPassword;
                    user.save().then(() => {
                        res.status(200).json({message: "Password change successful."});
                    }).catch(err => {
                        console.log(err);
                        res.status(500).json({message: err.message});
                    });
                }
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
};


const postUpdateStock = (req, res) => {
    try {
        const userId = mongoose.Types.ObjectId(req.user._id);
        User.findById(userId, (err, user) => {
            if (err) {
                res.status(500).json({message: err.message});
            } else if (!user) {
                res.status(404).json({message: "User not found"});
            } else {
                req.body.forEach(material => {
                    if (!mandatoryMaterials.includes(material.name)){
                        return res.status(500).json({message: "Required items cannot be deleted."});
                    }

                    material.count = normalize(material.count);
                });

                user.stock = req.body;
                user.save().then(() => {
                    res.json(user.stock);
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({message: err.message});
                });
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
}

const putUpdateStock = (req, res) => {
    try {
        const userId = mongoose.Types.ObjectId(req.user._id);
        User.findById(userId, (err, user) => {
            if (err) {
                res.status(500).json({message: err.message});
            } else if (!user) {
                res.status(404).json({message: "User not found"});
            } else {

                req.body.forEach(material => {
                    if (material.count < 0){
                        return res.status(500).json({message: "There are not enough products in stock."});
                    }

                    const item = user.stock.id(material._id);
                    item.count = normalize(material.count);
                });

                user.save().then(() => {
                    res.json(user.stock);
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({message: err.message});
                });
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
}


const postAddNewStock = (req, res) => {
    try {
        const userId = mongoose.Types.ObjectId(req.user._id);
        User.findById(userId, (err, user) => {
            if (err) {
                res.status(500).json({message: err.message});
            } else if (!user) {
                res.status(404).json({message: "User not found"});
            } else {
                user.stock.push(req.body);
                user.save().then(() => {
                    res.json(user.stock);
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({message: err.message});
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
};

const getStock = (req, res) => {
    try {
        const userId = mongoose.Types.ObjectId(req.user._id);
        User.findById(userId, (err, user) => {
            if (err) {
                res.status(500).json({message: err.message});
            } else if (!user) {
                res.status(404).json({message: "User not found"});
            } else {
                res.json(user.stock);
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(404).json({message: err.message});
    }
}

module.exports = {
    postLogin,
    postRegister,
    postUpdatePassword,
    postUpdateStock,
    putUpdateStock,
    postAddNewStock,
    getStock
};