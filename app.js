const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const dotenv = require('dotenv');

const router = require('./routes/routes');

const mongoose = require('mongoose');

const path = require('path');

const cors = require('cors');

dotenv.config();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//connecting db
mongoose.connect(process.env.DATABASE_URL).then(() => { console.log('Database Connected'); }).catch(err => console.log(err));

app.use(cors());

app.use(bodyParser.json());

app.use(router);

app.get("/",(req,res)=>{
    res.send("server running")
})

app.listen(process.env.PORT, () => {
    console.log("App is running in localhost:" + process.env.PORT);
});