const jwtAuth = require("./middleware/jwtAuth");
const {
    postLogin,
    postRegister,
    postUpdatePassword,
    postUpdateStock,
    putUpdateStock,
    postAddNewStock,
    getStock,
} = require("../controllers/user.controller");
const router = require('express').Router();

router.post('/login', postLogin);
router.post('/register', postRegister);
router.post('/updatePassword', jwtAuth, postUpdatePassword);
router.post('/updateStock', jwtAuth, postUpdateStock);
router.put('/updateStock', jwtAuth, putUpdateStock);
router.post('/addNewStock', jwtAuth, postAddNewStock);
router.get('/stock', jwtAuth, getStock);


module.exports = router;