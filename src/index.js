const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/route")
const mongoose = require("mongoose");
const app = express();
const multer = require('multer')

app.use(bodyParser.json());
app.use(multer().any());

mongoose.connect("mongodb+srv://atifpervez:34BmDa5XVvtznQvO@code.8mvlc.mongodb.net/group33Database"
  )
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});