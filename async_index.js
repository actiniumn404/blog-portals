const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const http = require("http");
const server = http.createServer(app);
const fs = require("fs");
const { exec } = require("child_process");

const Database = require("@replit/database");
const db = new Database();

app.use(cors());
app.use(helmet());

app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/account-created.css", async (req, res) => {
  res.sendFile(__dirname + "/account-created.css");
});

app.get("/msgs", async (req, res) => {
  res.sendFile(__dirname + "/data.json");
});

app.get("/script.js", async (req, res) => {
  res.sendFile(__dirname + "/script.js");
});

app.get("/style.css", async (req, res) => {
  res.sendFile(__dirname + "/style.css");
});

app.get("/login", async (req, res) => {
  const username = req.query.username.toLowerCase().toString();
  const password = req.query.password;

  const value = await db.get("users");
  const pws = await db.get("passwords");

  //Check if the database is empty
  if (value === null && psw === null) {
    res.end('{"success":"false"}');
  } else {
    userlist = value.split("||");
    passwordlist = psw.split("||");
    userindex = userlist.indexOf(username);

    console.log("\n====== USERNAME & PASSWORDS ======");

    for (let i = 0; i < userlist.length; i++) {
      console.log(userlist[i], ":", passwordlist[i]);
    }

    const toke = await db.get("tokens");

    //Give the user their token along with a clearence
    if (passwordlist[userindex] === password && userindex !== -1) {
      res.send(`{"success":"true", "token":"${toke.split("||")[userindex]}"}`);
    } else {
      res.send(`{"success":"false"}`);
    }
  }
});

app.get("/messages/log", async (req, res) => {
  const username = req.query.from.toLowerCase();
  const token = req.query.token;

  const value = await db.get("users");
  const toke = await db.get("tokens");

  const userlist = value.split("||");
  const tokenlist = toke.split("||");
  const userindex = userlist.indexOf(username);
  //Check using token auth to prevent impersonization
  if (tokenlist[userindex] === token) {
    fs.readFile("data.json", (err, data) => {
      if (err) throw err;
      //Get the message data and parse a replica
      let msgs = JSON.parse(data);
      //Add the message into the replica of the data
      msgs.push(
        JSON.parse(
          `{"to":${req.query.to},"from":"${req.query.from}", "title":"${req.query.title}", "message":"${req.query.msg}", "timestamp":"${req.query.timestamp}", "id":"${req.query.id}"}`
        )
      );
      //And put it back into the file
      fs.writeFile("data.json", JSON.stringify(msgs), function (err) {
        if (err) console.log("");
      });
      exec("npx prettier --write", (error, stdout, stderr) => {
        if (error) {
          console.log(` eror`);
          return;
        }
        if (stderr) {
          console.log(` `);
          return;
        }
      });
      //Success!!!
      res.redirect("/?id=" + req.query.id);
    });
  } else {
    res.end("Something went wrong");
  }
});

app.get("/token/check", async (req, res) => {
  const username = req.query.username.toLowerCase();
  const token = req.query.token;
  const value = await db.get("users");
  const toke = await db.get("tokens");
  const userlist = value.split("||");
  const tokenlist = toke.split("||");
  const userindex = userlist.indexOf(username);
  if (tokenlist[userindex] === token) {
    res.send(`{"a":"true"}`);
  } else {
    res.send(`{"a":"false"}`);
  }
});

app.get("/signup", async (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});
app.get("/account-created", async (req, res) => {
  res.sendFile(__dirname + "/account-created.html");
});

app.get("/signup/log", async (req, res) => {
  const username = req.query.username.toLowerCase();
  const password = req.query.password;
  const v = await db.get("users");
  const value = await db.get("passwords");
  const va = await db.get("tokens");

  // Check if there is any usernames in the database
  if (v === null) {
    userlist = "";
  } else {
    userlist = v;
  }
  // Muliple accout prevention
  if (!userlist.split("||").includes(username)) {
    //Set the username
    await db.set("users", userlist + "||" + username);
    // Check if there is any passwords in the database
    if (value === null) {
      psw = "";
    } else {
      psw = value;
    }
    //Set the password
    await db.set("passwords", psw + "||" + password);
    // Check if there is any tokens in the database
    if (va === null) {
      tok = "";
    } else {
      tok = va;
    }
    //Set the token
    await db.set("tokens", tok + "||" + generate_token());
    //Get the data from the mailbox
    fs.readFile("data.json", (err, data) => {
      if (err) throw err;
      //Parse a replica
      let msgs = JSON.parse(data);
      //Create a mailbox for the new user
      msgs[username] = [];
      //Merge it into the main mailbox
      fs.writeFile("data.json", JSON.stringify(msgs), function (err) {
        if (err) console.log("");
      });

      exec("npx prettier --write", (error, stdout, stderr) => {
        if (error) {
          console.log(` eror`);
          return;
        }
        if (stderr) {
          console.log(` `);
          return;
        }
      });
    });
    //Done.
    res.redirect("/account-created");
  } else {
    res.send(
      "An account with this username has already been created.<br><a href='/signup'>Create a new account</a>"
    );
  }
});

server.listen(3000, () => {
  console.log("Server online");
});

function generate_token() {
  token = "";
  chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`~!@#$%^&*()_+1234567890]}[{,<.>/?".split(
      ""
    );
  // "Take a random item from a newly shuffled list of chars 32 times"
  for (let looper = 0; looper < 32; looper++) {
    token += shuffle(chars)[randint(0, chars.length - 1)];
  }
  return token;
}

//Thank you stackoverflow

function shuffle(array) {
  var currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ];
  }

  return array;
}

//I made this RANDom INTiger (RANDINT) generator myself.

function randint(a, b) {
  randum = Math.ceil(Math.random() * (b - a) - 1) + a - 1;
  return Math.abs(randum);
}
