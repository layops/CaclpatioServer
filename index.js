const express =  require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const loggerMiddleware = require("./routes/middleware/loggerMiddleware");

const app = express();
const port = process.env.PORT || 5000;

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION!');
});


app.use(require('helmet')());
app.use(express.json());
app.use(cors());

//route
app.use(loggerMiddleware);
app.use('/api/user', require('./routes/user.route'));

app.get('/', (req,res)=>{
    res.status(200).send();
});

app.use((err, req, res, next)=>{

})

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then(() => app.listen(port, () => {
        console.log("Server is running on port: " + port);
    }))
    .catch((error) => console.log(error));

mongoose.set("useFindAndModify",false);
