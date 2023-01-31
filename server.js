const express = require('express');
const app = express();

const mongoose = require("mongoose");
const cors = require("cors");

app.use(cors());
app.use(express.json())


const connectionString = ``;
mongoose.set('strictQuery', false);
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("Connected to MongoDB Atlas!");
});


const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", userSchema);







const port = 3000;
app.get('/', (req, res) => {
  res.send("Welcome to my game")
});

app.use(express.json());

app.post('/users', async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password
    const newUser = new User({
      username: username,
      password: password
    });
    const user = await newUser.save();
    res.send("User save in database");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get('/game/:id', (req, res) => {
  // Retrieve game information for the specified ID
});

app.post('/game', (req, res) => {
  // Create a new game
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
