var blogdata
var contributor = new Array()
var token
var postnum = 0
var postcount = 0;
const urlsearch = new URLSearchParams(window.location.search)
let blogid = urlsearch.get("id")
if (!blogid){
  mask = `<div style="top: 0;position: fixed;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.4);z-index: 5;"></div>`
  text = `<div style="display:block;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;background-color:#fff;padding:10px 30px;border-radius:.2em;min-width:10%;"><p style="text-align:center;"><h1>400 Bad Request</h1><br>Please add your blog id (see below) to the url, or just use this form: <form><input placeholder="Insert blog id" required name="id"><button>Go!</button></form><br><h3>What is your blog id?</h3>Take the url of the blog you are trying to log into. (e.g. If I were trying to log into @forester2015's blog, Random stuff, I would take the url <a href="https://artofproblemsolving.com/community/c1632725_random_stuff">https://artofproblemsolving.com/community/c1632725_random_stuff.</a> The blog id is the letter c plus a number, and can be found after the community part in the url. (Be careful not to include the underscores and the text in the url) Therefore, the blog id for @forester2015's blog would be <span style="background-color:yellow">c1632725</span>.</p></div>`
  $("body").append(mask, text)
}
var admins = new Array()
var user

function error() {
  mask = `<div style="top: 0;position: fixed;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.4);z-index: 5;"></div>`
  text = `<div style="display:block;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;background-color:#fff;padding:10px 30px;border-radius:.2em;min-width:10%;"><p>Oops! Something went wrong. You will be reloaded in 3 seconds</p><button id="logout" onclick="location.reload()">Reload Now</button><button id="logout" onclick="clearTimeout(i)" style="margin-left:10px;">... or debug</button></div>`
  $("body").append(mask, text)
  i = setTimeout(()=>{location.reload()}, 3000)
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
        user = $("inputusernamelogin").val()
        $("#login").remove()
      }
    })
})
function aopsframe(){
  fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://artofproblemsolving.com/community/'+blogid)}`)
  .then(data=>data.json())
  .then((data) => {
    frame = document.body.appendChild(document.createElement("IFRAME"))
    frame.contentWindow.document.write(data["contents"]);
    frame.contentWindow.document.head.remove()
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
  username = username
  // Get the contributors
  try{
    raw_contrib = blogdata.blog_base.contributors
  }catch(err){
    if (blogid !== null){
      error()
    }
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
  $("#mesgfrom").val(username)
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
        let msggg = bbcodeparse(decodeURIComponent(raw_message.message))
        d = new Date()
        //Get the UTC time+date of when the message was sent
        t = new Date(raw_message.timestamp)
        //Convert UTC to User's time zone by subtracting the time zone offset in milliseconds for some reason
        newtime = new Date(t + d.getTimezoneOffset()*60000)
        time = newtime.toLocaleDateString() + " " + newtime.toLocaleTimeString()
        $("#message_container").append(`<tr class="mail_cont" onclick="open_msg(\`${raw_message.from}\`, \`${raw_message.title}\`, \`${msggg}\`, \`${time}\`)">
              <th><input type="checkbox"></th>
              <th class="sender">${raw_message.from}</th>
              <th class="message_title">${raw_message.title}</th>
              <th class="message_message" style="height:20px !important;">${msggg}</th>
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

function request_contrib(){
  $("#editor").show()
  $("#msegtoo").val("admins")
  $("#msegsub").val("Contributor request")
}



$("#editor form").submit((e)=>{
  let d=new Date()
  let timestring = d.toUTCString()
  $("#mesgtime").val(timestring)
  $("#msegid").val(blogid)
  $("#realmessage").val(encodeURIComponent($("#realmessage").val()))
  $("#tokennn").val(token)
})

function inserttext(starttext, endtext){
  let start = $("#realmessage").prop("selectionStart")
  let end = $("#realmessage").prop("selectionEnd")
  $("#realmessage").val(
    $("#realmessage").val().substring(0, start)
    +starttext+
    $("#realmessage").val().substring(start, end)+
    endtext+
    $("#realmessage").val().substring(end)
  )
  document.querySelector("#realmessage").focus()
  document.querySelector("#realmessage").setSelectionRange(start+starttext.length, start+starttext.length)
}

function bbcodeparse(text){
  let dol = "$"

  var x = text

  x=x.replace(/</g, "&lt;")

  x=x.replace(/>/g, "&gt;")

  x=x.replace(/\n/g, "<br>")

  x=x.replace(/\[hide=(.*)\](.*)\[\/hide\]/g, "<span class='hidetag' onclick='jQuery(this).next().next().toggle()'>$1</span><br><div class='hidetagcontent'>$2</div>")

  x=x.replace(/\[hide\](.*)\[\/hide\]/g, "<span class='hidetag' onclick='jQuery(this).next().next().toggle()'>Click to reveal hidden text</span><br><div class='hidetagcontent'>$1</div>")

  x=x.replace(/\[b\](.*)\[\/b\]/g, "<b>$1</b>")

  x=x.replace(/\[color=([#a-zA-Z0-9]+)\](.*)\[\/color\]/g, "<span style='color:$1'>$2</span>")

  x=x.replace(/\[font=(.*)\](.*)\[\/font\]/g, "<span style='font-family:$1'>$2</span>")

  x=x.replace(/\[i\](.*)\[\/i\]/g, "<i>$1</i>")

  x=x.replace(/\[img\](.*)\[\/img\]/g, "<img src='$1'>")

  x=x.replace(/\$\$(.*)\$\$/g, "\\[$1\\]")

  x=x.replace(/\$(.*)\$/g, "\\($1\\)")

  x=x.replace(/\[rule\]/g, "<hr>")

  x=x.replace(/\[u\](.*)\[\/u\]/g, "<u>$1</u>")

  x=x.replace(/\[url=(.*)\](.*)\[\/url\]/g, "<a href='$1' target='_blank'>$2</a>")

  x=x.replace(/\[url\](.*)\[\/url\]/g, "<a href='$1' target='_blank'>$1</a>")

  x=x.replace(/\[size=(.*)\](.*)\[\/size\]/g, "<span style='font-size:$1'>$2</span>")

  MathJax.typeset()
  return x
}