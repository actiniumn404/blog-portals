var blogdata
var contributor = new Array()
var token
var postnum = 0
var postcount = 0;
const urlsearch = new URLSearchParams(window.location.search)
let blogid = "c1632725"
var admins = new Array()
let igettheerror = true

function error() {
  mask = `<div style="top: 0;position: fixed;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.4);z-index: 5;"></div>`
  text = `<div style="display:block;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;background-color:#fff;padding:10px 30px;border-radius:.2em;min-width:10%;"><p>Oops! Something went wrong. You will be reloaded in 3 seconds</p><button id="logout" onclick="location.reload()">Reload Now</button></div>`
  $("body").append(mask, text)
  i = setTimeout(()=>{location.reload()}, 3000)
  if (igettheerror === true){
    clearTimeout(i)
  }
}

$("#loginform").submit(function(e){
  e.preventDefault();
  fetch("/login?username="+$("#inputusernamelogin").val()+"&password="+$("#inputpasswordlogin").val())
    .then(e=>e.json())
    .then(data=>{
      console.log(data)
      if (data["success"] === "false"){
        alert("Password is incorrect")
      }else{
        changedata($("#inputusernamelogin").val())
        token = data["token"]
        if ($("#keepmelogedin").prop("checked") === true){
          document.cookie = "__tok="+encodeURIComponent(token)+"; expires=31 Dec 3000 12:00:00 UTC; path=/";
          document.cookie = "__name="+$("#inputusernamelogin").val()+"; expires=31 Dec 3000 12:00:00 UTC; path=/";
        }
        $("#login").remove()
      }
    })
})
function aopsframe(){
  fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://artofproblemsolving.com/community/'+blogid)}`)
  .then(data=>data.json())
  .then((data) => {
    $("body").append("<iframe id='frameaops'></iframe>")
    frame = document.getElementById("frameaops")
    console.log($("#frameaops").contents().find("html"))
    $("#frameaops").contents().find("html").html(data["contents"]);
    $("#frameaops").contents().find("head").remove()
    blogdata = frame.contentWindow.AoPS.bootstrap_data;
    frame.remove()
    //j=setTimeout(()=>{console.clear()}, 10000)
  })//.catch(err=>error())
  /*$.post(`https://api.allorigins.win/get?url=${encodeURIComponent('https://artofproblemsolving.com/community/'+blogid)}`, function(data){
    var a = data
    console.log(data, data["contents"])
    $("body").append("<iframe id='frame'>"+data["contents"]+"</iframe>")
    //Doing this as I cannot do it in JQuery
    var blogdata = document.getElementById("frame").contentWindow.AoPS.bootstrap_data;
    $("#frame").remove();
  })*/
}
function changedata(username){
  // Get the contributors
  try{
    raw_contrib = blogdata.blog_base.contributors
  }catch(err){
    error()
  }
  raw_contrib.forEach((map)=>{
    contributor.push(map.username.toLowerCase())
  })
  admins = key(blogdata.blog_topics.topics_data[key(blogdata.blog_topics.topics_data)[0]]["roles"]) 
  if (contributor.includes(username.toLowerCase())){
    $("#titlerole").html("Blog Contributor")
    if (admins.includes(blogdata.blog_base.contributors[findindex(contributor, username)]["user_id"])){
      $("#titlerole").html("Blog Admin")  
    }
  create_msgs(username)
  $("#avatar").attr("src", `https://avatar.artofproblemsolving.com/avatar_${blogdata.blog_base.contributors[findindex(contributor, username)]["user_id"]}.png`)
  }else{
    $("#beg4contrib").css("display","block");
  }
  $("#usernamedisplay").html(username)
}

function create_msgs(us){
  username = us.toLowerCase()
  fetch("/msgs").then(data=>data.json()).then((data)=>{
    $("#message_container").html("")
    messagelist = data[username.toLowerCase()]
    if (contributor.includes(username.toLowerCase())){
      messagelist = messagelist.concat(data["all_contributors"])
    }if (admins.includes(blogdata.blog_base.contributors[findindex(contributor, username)]["user_id"])){
      messagelist = messagelist.concat(data["admins"])
    }
    messagelist.forEach((raw_message)=>{
      if (raw_message.id === blogid){
        console.warn("it worked")
        //A base
        d = new Date()
        //Get the UTC time+date of when the message was sent
        t = new Date(raw_message.timestamp)
        //Convert UTC to User's time zone by subtracting the time zone offset in milliseconds for some reason
        newtime = new Date(t + d.getTimezoneOffset()*60000)
        time = newtime.toLocaleDateString() + " " + newtime.toLocaleTimeString()
        $("#message_container").append(`<tr class="mail_cont" onclick="open_msg(\`${raw_message.from}\`, \`${raw_message.title}\`, \`${raw_message.message}\`, \`${time}\`)">
              <th><input type="checkbox"></th>
              <th class="sender">${raw_message.from}</th>
              <th class="message_title">${raw_message.title}</th>
              <th class="message_message">${raw_message.message}</th>
              <th class="message_sent_time">${time}</th>
            </tr>`)
      }
    })
  })
}

function findindex(array, target){
  for (let looper=0;looper<array.length;looper++){
    if (array[looper]===target.toLowerCase()){
      return looper
      break
    }
  }
}
function key(jsonarray){
  ac = new Array()
  for (let aa in jsonarray){
    ac.push(aa)
  }
  return ac
}
function open_msg(fromm, title, message, timestamp){
  $("#msgtitle").html(title)
  $("#msgfrom").html(fromm)
  $("#msgmsg").html(message)
  $("#msgtimestamp").html(timestamp)
  $("#message").css("display","block")
}
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
$(function(){
  aopsframe()
if (getCookie("__name") && getCookie("__tok")){
fetch(`/token/check?username=${getCookie("__name")}&token=${encodeURIComponent(getCookie("__tok"))}`).then(data=>data.json()).then((res)=>{
  if (res.a === "true"){
    changedata(getCookie("__name"))
    $("#login").css("display", "none")
  }
  token = getCookie("__tok")
})}})
// #stackoverflow_is_the_best
function delete_all_cookies(){
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });

}

function request_contrib(text){
  d=new Date()
  timestring = d.toUTCString()
  fetch(`https://forester-blog.andrewchen51.repl.co/messages/log?from=${username}&to=admins&title=Contributor%20Request&msg=${encodeURIComponent(text)}&timestamp=${encodeURIComponent(timestring)}&token=${encodeURIComponent(token)}&id=${blogid}`)
}
