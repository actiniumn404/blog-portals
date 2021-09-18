var blogdata;
var contributor = new Array();
var admins = new Array();
var user;
var token;
let admin = false;
const urlsearch = new URLSearchParams(window.location.search);
const blogid = urlsearch.get("id");

if (!blogid) {
  let mask = `<div style="top: 0;position: fixed;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.4);z-index: 5;"></div>`;

  let text = `<div id="errormodal" style="display:block;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;background-color:#fff;padding:10px 30px;border-radius:.2em;min-width:10%;"><p style="text-align:center;"><h1>Enter Your Blog ID</h1><br>Please add your blog ID to the URL <span class="tooltip">e.g.
  <span class="tooltiptext"> <a href="https://blogs.andrewchen51.repl.co/?id=c1632725">https://blogs.andrewchen51.repl.co/?id=c1632725</a></span></span>, or just use this form: <br /><br /> 
  
  <div>
	<form><input placeholder="Insert blog ID" required name="id" class="forminput"><br><button style="margin-left: 4px">Go!</button></form>
  </div>

  <br>
  
  <h3>What is your blog id?</h3>
  
  <div class="desc">
  Take the url of the blog you are trying to log into. If I were trying to log into @forester2015's blog, Random Stuff, I would take the url <a href="https://artofproblemsolving.com/community/c1632725_random_stuff">https://artofproblemsolving.com/community/c1632725_random_stuff</a>. The blog ID is the letter 'c', then a number. It can be found after the community part in the URL (Be careful not to include the underscores and the text). Therefore, the blog id for @forester2015's blog would be <span style="background-color:#009aff59">c1632725</span>.</div>`;

  $("body").append(mask, text);
}

function error() {
  //location.reload();
  let mask = `<div style="top: 0;position: fixed;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.4);z-index: 5;"></div>`;
  let text = `<div style="display:block;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;background-color:#fff;padding:10px 30px;border-radius:.2em;min-width:10%;"><p>Oops! Something went wrong. You will be reloaded in 3 seconds. (This error is a known bug, we are debugging. If you refresh this will go away I think)</p><button id="logout" onclick="location.reload()">Reload Now</button><button id="logout" onclick="clearTimeout(i)" style="margin-left:10px;">... or debug</button></div>`;
  $("body").append(mask, text);
  i = setTimeout(() => {
    location.reload();
  }, 3000);
}

$("#loginform").submit(function (e) {
  e.preventDefault();
  fetch(
    "/login?username=" +
      $("#inputusernamelogin").val() +
      "&password=" +
      encodeURIComponent($("#inputpasswordlogin").val())
  )
    .then(e => e.json())
    .then(data => {
      console.log(data);
      if (data["success"] === "false") {
        alert("Password is incorrect");
      } else {
        changedata($("#inputusernamelogin").val());
        token = data["token"];

        if ($("#keepmelogedin").prop("checked") === true) {
          document.cookie =
            "__tok=" +
            encodeURIComponent(token) +
            "; expires=31 Dec 3000 12:00:00 UTC; path=/";
          document.cookie =
            "__name=" +
            $("#inputusernamelogin").val() +
            "; expires=31 Dec 3000 12:00:00 UTC; path=/";
        }
        $("#login").remove();
      }
    });
});
function aopsframe() {
  fetch(
    `https://api.allorigins.win/get?url=${encodeURIComponent(
      "https://artofproblemsolving.com/community/" + blogid
    )}`
  )
    .then(data => data.json())
    .then(data => {
      let frame = document.body.appendChild(document.createElement("IFRAME"));
      frame.contentWindow.document.write(data["contents"]);
      frame.contentWindow.document.head.remove();
      blogdata = frame.contentWindow.AoPS.bootstrap_data;
      frame.remove();

      //j=setTimeout(()=>{console.clear()}, 10000)
    }); //.catch(err=>error())
  /*$.post(`https://api.allorigins.win/get?url=${encodeURIComponent('https://artofproblemsolving.com/community/'+blogid)}`, function(data){
    var a = data
    console.log(data, data["contents"])
    $("body").append("<iframe id='frame'>"+data["contents"]+"</iframe>")
    //Doing this as I cannot do it in JQuery
    var blogdata = document.getElementById("frame").contentWindow.AoPS.bootstrap_data;
    $("#frame").remove();
  })*/
}
function changedata(username) {
  username = username;
  // Get the contributors
  try {
    raw_contrib = blogdata.blog_base.contributors;
  } catch (err) {
    if (blogid !== null) {
      error();
    }
  }
  create_msgs(username);
  raw_contrib.forEach(map => {
    contributor.push(map.username.toLowerCase());
  });
  admins = key(
    blogdata.blog_topics.topics_data[key(blogdata.blog_topics.topics_data)[0]][
      "roles"
    ]
  );
  if (contributor.includes(username.toLowerCase())) {
    $("#titlerole").html("Blog Contributor");
    if (
      admins.includes(
        blogdata.blog_base.contributors[findindex(contributor, username)][
          "user_id"
        ]
      )
    ) {
      $("#titlerole").html("Blog Admin");
      admin = true;
    }
    $("#avatar").attr(
      "src",
      `https://avatar.artofproblemsolving.com/avatar_${
        blogdata.blog_base.contributors[findindex(contributor, username)][
          "user_id"
        ]
      }.png`
    );
  } else {
    $("#beg4contrib").css("display", "block");
  }
  $("#usernamedisplay").html(username);
  $("#mesgfrom").val(username);
  $("main>div:nth-child(1)").height($("aside").height() + 35);
}

function create_msgs(us) {
  username = us.toLowerCase();

  fetch("/msgs")
    .then(data => data.json())
    .then(data => {
      messagelist = new Array();
      $("#message_container").html("");
      let d = new Array();
      key(data).forEach(k => d.push(data[k]));
      d.forEach(meseg => {
        if (
          meseg.to.split("||").includes(username) ||
          (admin && meseg.to.split("||").includes("admins")) ||
          (contributor.includes(username) &&
            meseg.to.split("||").includes("all-contributors")) ||
          meseg.to.split("||").includes("everyone")
        ) {
          messagelist.push(meseg);
        }
      });
      // last activity time
      document.cookie = `__lastactivity=${Date.now()}; expires=31 Dec 3000 12:00:00 UTC; path=/`;
      let counter = 0;
      messagelist.forEach(raw_message => {
        if (raw_message.id === blogid) {
          console.warn("it worked");
          //A base
          let msggg = bbcodeparse(decodeURIComponent(raw_message.message));
          //Get the UTC time+date of when the message was sent
          newtime = new Date(parseInt(raw_message.timestamp));
          time =
            newtime.toLocaleDateString() + " " + newtime.toLocaleTimeString();
          $("#message_container")
            .append(`<tr class="mail_cont" onclick="open_msg(\`${raw_message.from.replace(
            /"/g,
            "&#34;"
          )}\`, \`${raw_message.title.replace(/"/g, "&#34;")}\`, \`${msggg
            .replace(/"/g, "&#34;")
            .replace(/\\/g, "\\\\")}\`, \`${time.replace(
            /"/g,
            "&#34;"
          )}\`, \`${encodeURIComponent(
            JSON.stringify(raw_message.replies)
          )}\`);MathJax.typeset();hljs.highlightAll();$('#msegtoo, #msegsub, #replymessage').val('');$('.replypreview').html('');$('#towho').html('${raw_message.to.replace(
            /\|\|/g,
            ", "
          )}');msgid=${key(data)[counter]};">
              <th><input type="checkbox"></th>
              <th class="sender">${raw_message.from}</th>
              <th class="message_title">${raw_message.title}</th>
              <th class="message_message" style="height:20px !important;">${decodeURIComponent(
                raw_message.message
              )}</th>
              <th class="message_sent_time">${time}</th>
            </tr>`);
          counter++;
        }
      });
    });
}

function findindex(array, target) {
  for (let looper = 0; looper < array.length; looper++) {
    if (array[looper] === target.toLowerCase()) {
      return looper;
    }
  }
}
function key(jsonarray) {
  ac = new Array();
  for (let aa in jsonarray) {
    ac.push(aa);
  }
  return ac;
}
function open_msg(fromm, title, message, timestamp, replies) {
  $("#msgtitle").html(title);
  $("#msgfrom").html(fromm);
  $("#msgmsg").html(message);
  $("#msgtimestamp").html(timestamp);
  let replyparse = JSON.parse(decodeURIComponent(replies));
  $("#replies").html("");
  if (replyparse !== []) {
    replyparse.forEach(a => {
      let newtime = new Date(parseInt(a.timestamp));
      $("#replies").append(`<div class="reply">
            <span style="color:gray">${
              a.from
            }</span> <span style="float:right;">${
        newtime.toLocaleDateString() + " " + newtime.toLocaleTimeString()
      }</span><br>
            <div class="replymessagemessage">${bbcodeparse(
              decodeURIComponent(a.message)
            )}</div>
            <hr />
          </div>`);
    });
  }
  $("#message").fadeIn(100);
}
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
$(function () {
  $("#login .signup").attr(
    "href",
    "/signup?next=" + encodeURIComponent(window.location.href)
  );
  aopsframe();
  if (getCookie("__name") && getCookie("__tok")) {
    fetch(
      `/token/check?username=${getCookie("__name")}&token=${encodeURIComponent(
        getCookie("__tok")
      )}`
    )
      .then(data => data.json())
      .then(res => {
        if (res.a === "true") {
          changedata(getCookie("__name"));
          $("#login").css("display", "none");
        }
        token = getCookie("__tok");
      });
  }
});
// #stackoverflow_is_the_best
function delete_all_cookies() {
  document.cookie = "__tok=; expires=31 Dec 1999 12:00:00 UTC; path=/";
  document.cookie = "__name=;expires=31 Dec 1999 12:00:00 UTC; path=/";
}

function request_contrib() {
  $("#editor").show();
  $("#msegtoo").val("admins");
  $("#msegsub").val("Contributor request");
}

$("#editor form").submit(e => {
  document.querySelector("#msegtoo").value += `||${document.cookie
    .split(";")[1]
    .slice(8)}`;

  timestring = Date.now();
  $("#mesgtime").val(timestring);
  $("#msegid").val(blogid);
  $("#msegtoo").val($("#msegtoo").val() + "||" + username);
  $("#msegtoo").val($("#msegtoo").val().toLowerCase());
  $("#realmessage").val(encodeURIComponent($("#realmessage").val()));
  $("#tokennn").val(token);
});

function inserttext(starttext, endtext, a = "#realmessage") {
  let start = $(a).prop("selectionStart");
  let end = $(a).prop("selectionEnd");
  $(a).val(
    $(a).val().substring(0, start) +
      starttext +
      $(a).val().substring(start, end) +
      endtext +
      $(a).val().substring(end)
  );

  document
    .querySelector(a)
    .setSelectionRange(start + starttext.length, start + starttext.length);
  document.querySelector(a).focus();
}

function bbcodeparse(text) {
  let x = text;

  x = x.replace(/</g, "&lt;");

  x = x.replace(/>/g, "&gt;");

  x = x.replace(/\n/g, "<br>");

  x = x.replace(
    /\[code=(.*)\](.*)\[\/code\]/g,
    "<pre><code class='language-$1'>$2</code></pre>"
  );

  x = x.replace(
    /\[hide=(.*)\](.*)\[\/hide\]/g,
    "<span class='hidetag' onclick='jQuery(this).next().next().toggle()'>$1</span><br><div class='hidetagcontent'>$2</div>"
  );

  x = x.replace(/\[quote\](.*)\[\/quote\]/g, "<span class='quote'>$1</span>");
  x = x.replace(
    /\[quote=(.*)\](.*)\[\/quote\]/g,
    "<span class='quote'><i>$1 wrote:</i><br>$2</span>"
  );

  x = x.replace(
    /\[hide\](.*)\[\/hide\]/g,
    "<span class='hidetag' onclick='jQuery(this).next().next().toggle()'>Click to reveal hidden text</span><br><div class='hidetagcontent'>$1</div>"
  );

  x = x.replace(/\[b\](.*)\[\/b\]/g, "<b>$1</b>");

  x = x.replace(
    /\[color=([#a-zA-Z0-9]+)\](.*)\[\/color\]/g,
    "<span style='color:$1'>$2</span>"
  );

  x = x.replace(
    /\[font=(.*)\](.*)\[\/font\]/g,
    "<span style='font-family:$1'>$2</span>"
  );

  x = x.replace(/\[i\](.*)\[\/i\]/g, "<i>$1</i>");

  x = x.replace(
    /\[code\](.*)\[\/code\]/g,
    "<pre><code class='language-plaintext'>$1</code></pre>"
  );

  x = x.replace(/\[img\](.*)\[\/img\]/g, "<img src='$1'>");

  x = x.replace(
    /\[youtube\](.*)\[\/youtube\]/g,
    `<iframe width="560" height="315" src="https://www.youtube.com/embed/$1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  );

  x = x.replace(/\$\$(.*)\$\$/g, "\\[$1\\]");

  x = x.replace(/\$(.*)\$/g, "\\($1\\)");

  x = x.replace(/\[rule\]/g, "<hr>");

  x = x.replace(/\[u\](.*)\[\/u\]/g, "<u>$1</u>");

  x = x.replace(
    /\[url=(.*)\](.*)\[\/url\]/g,
    "<a href='$1' target='_blank'>$2</a>"
  );

  x = x.replace(/\[url\](.*)\[\/url\]/g, "<a href='$1' target='_blank'>$1</a>");

  x = x.replace(
    /\[size=(.*)\](.*)\[\/size\]/g,
    "<span style='font-size:$1'>$2</span>"
  );

  MathJax.typeset();
  return x;
}

const appendToInput = text => {
  if (document.querySelector("#msegtoo").value.includes("||")) {
    if (document.querySelector("#msegtoo").value.endsWith("||")) {
      document.querySelector("#msegtoo").value += text;
    }
  } else {
    document.querySelector("#msegtoo").value = text;
  }

  document.querySelector("#msegtoo").focus();
};
$("#editor").hide();
$("#message").hide();
$("main>div:nth-child(1)").height($("aside").height() + 35);
