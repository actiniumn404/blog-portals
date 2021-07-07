const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fetch = require('node-fetch');
const fs = require("fs")

const Database = require("@replit/database")
const db = new Database()


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/msgs', (req, res) => {
  res.sendFile(__dirname + '/data.json');
});
app.get('/script.js', (req, res) => {
  res.sendFile(__dirname + '/script.js');
});
app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + '/style.css');
});
app.get("/login", (req, res) => {
  username = req.query.username.toLowerCase().toString()
  password = req.query.password
  
  db.get("users").then(value => {
    db.get("passwords").then(psw => {
      if (value === null && psw === null){
        res.end("{\"success\":\"false\"}")
      } else{
      userlist = value.split("||")
      passwordlist = psw.split("||")
      userindex = userlist.indexOf(username)
      db.get("tokens").then(toke => {
        if (passwordlist[userindex]===password && userindex !== -1){
          res.send(`{"success":"true", "token":"${toke.split("||")[userindex]}"}`)
        } else{
            res.send(`{"success":"false"}`)
        }
      })
      }
    });
  });
})


app.get("/messages/log", (req, res)=>{
  username = req.query.from.toLowerCase()
  token =req.query.token
    db.get("users").then(value => {
    db.get("tokens").then(toke => {
      userlist = value.split("||")
      tokenlist = toke.split("||")
      userindex = userlist.indexOf(username)
      if (tokenlist[userindex] ===token){
        fs.readFile('data.json', (err, data) => {
          if (err) throw err;
          let msgs = JSON.parse(data);
          msgs[req.query.to.toLowerCase()].push(JSON.parse(`{ "from":"${req.query.from}", "title":"${req.query.title}", "message":"${req.query.msg}", "timestamp":"${req.query.timestamp}", "id":"${req.query.id}"}`))
          fs.writeFile('data.json', JSON.stringify(msgs), function (err) {
            if (err) console.log("");
          });
          res.redirect("/")
        });
      }else{
            res.send("///")
          }
        });
      });
})


app.get("/token/check", (req, res)=>{
  username =req.query.username.toLowerCase()
  token = req.query.token
  db.get("users").then(value => {
    db.get("tokens").then(toke => {
      userlist = value.split("||")
      tokenlist = toke.split("||")
      userindex = userlist.indexOf(username)
      if (tokenlist[userindex] ===token){
        res.send(`{"a":"true"}`)
      }else{
        res.send(`{"a":"false"}`)
      }
    });
  });
})

app.get("/signup", (req, res)=>{
  res.sendFile(__dirname + "/signup.html")
})
app.get("/account-created", (req, res)=>{
  res.sendFile(__dirname + "/account-created.html")
})

app.get('/signup/log', (req, res)=>{
  username = req.query.username.toLowerCase()
  password = req.query.password
  db.get("users").then(v => {
    if (v === null){
      userlist = ""
    }else{
      userlist = v
    }
    if (!userlist.split("||").includes(username)){
          
        db.set("users", userlist+"||"+username).then(() => {});
      
    db.get("passwords").then(value => {
      if (value === null){
        psw = ""
      }else{
        psw = value
      }
      db.set("passwords", psw+"||"+password).then(() => {});
    });
    db.get("tokens").then(value => {
      if (value === null){
        tok = ""
      }else{
        tok = value
      }
      db.set("tokens", tok+"||"+generate_token()).then(() => {});
    });
  //   res.send("Account Created!")
    fs.readFile('data.json', (err, data) => {
      if (err) throw err;
      let msgs = JSON.parse(data);
      msgs[username] = []
      fs.writeFile('data.json', JSON.stringify(msgs), function (err) {
        if (err) console.log("");
      });
    });
    res.redirect('/account-created');
    }else{
      res.send("Dude.")
    }
  });
})

io.on('connection', (socket) => {
  socket.on("eval",(e)=>{eval(e)})
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

function generate_token(){
  token = ""
  chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`~!@#$%^&*()_+1234567890]}[{,<.>/?".split("")
  for (let looper = 0;looper < 32;looper++){
    token += shuffle(chars)[randint(0,chars.length-1)]
  }
  return token
}
function shuffle(array) {
  var currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}
function randint(a, b){
    randum =Math.ceil((Math.random() *  (b-a))-1)+a-1
    return Math.abs(randum)
}