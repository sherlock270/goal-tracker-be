require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const server = express();
const knex = require("knex");
const dbConfig = require("./knexfile");
const db = knex(dbConfig.development);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

server.use(cors());
server.use(helmet());
server.use(express.json());

function generateToken(user) {
  const payload = {
    username: user.username
  };

  const options = {
    expiresIn: "1hr",
    jwtid: "12345"
  };

  return jwt.sign(payload, process.env.JWT_KEY, options);
}

server.get("/", (req, res) => {
  console.log("I was called");
  res.status(200).json({ message: "mission accomplished" });
});

server.get("/err", (req, res) => {
  res.status(500).json({ message: "simulated error" });
});

server.get("/users", (req, res) => {
  db.select("username")
    .from("users")
    .then(data => res.status(200).json({ users: data }));
});

server.post("/signup", (req, res) => {
  const creds = req.body;
  if (creds.username != "" && creds.password != "") {
    creds.password = bcrypt.hashSync(creds.password, 12);

    db("users")
      .insert(creds)
      .then(id => {
        db("users")
          .where({ userID: id[0] })
          .first()
          .then(user => {
            const token = generateToken(user);

            res
              .status(200)
              .json({ message: "user created and logged in", token: token });
          });
      })
      .catch(err => console.error(err));
  } else {
    res.status(400).json({ error: "Username and password required" });
  }
});

server.post("/login", (req, res) => {
  const creds = req.body;
  console.log("Logging in user", creds.username);
  db("users")
    .where({ username: creds.username })
    .then(data => {
      if (data.length === 0) {
        res.status(401).json({ error: "Login failed" });
      } else {
        const user = data[0];
        const token = generateToken(creds);

        if (bcrypt.compareSync(creds.password, user.password)) {
          res.status(200).json({ message: "logged in", token: token });
        } else {
          res.status(401).json({ error: "Login failed" });
        }
      }
    });
});

server.listen(8000, () => console.log("=== Listening on port 8000 ==="));
