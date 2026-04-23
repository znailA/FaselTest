const API = "https://ali8537291-server-bot.hf.space";

// ========= HOME =========
async function loadHome(){
  let r = await fetch(API+"/home");
  let d = await r.json();

  hero(d.latest[0]);

  render("🔥 جديد", d.latest);
  render("⭐ مختار", d.choosed);
  render("🎯 مقترح", d.recommended);
}

function hero(item){
  document.getElementById("hero").style.backgroundImage =
  `url(${item.backdrop_path})`;

  document.getElementById("hero").innerHTML =
  `<div>${item.title || item.name}</div>`;
}

function render(title,items){
  let home = document.getElementById("home");

  let sec = document.createElement("div");
  sec.className="section";
  sec.innerHTML=`<h3>${title}</h3>`;

  let row=document.createElement("div");
  row.className="row";

  items.forEach(i=>{
    let c=document.createElement("div");
    c.className="card";
    c.onclick=()=>location.href="details.html?id="+i.id;

    c.innerHTML=`
      <img src="${i.poster_path}">
    `;
    row.appendChild(c);
  });

  sec.appendChild(row);
  home.appendChild(sec);
}

// ========= SEARCH =========
if(document.getElementById("search")){
document.getElementById("search").oninput = async(e)=>{
  let q=e.target.value;

  if(q.length<2) return;

  let r=await fetch(API+"/search?q="+q);
  let d=await r.json();

  let list=d.search || d;

  let grid=document.getElementById("results");
  grid.innerHTML="";

  list.forEach(i=>{
    let c=document.createElement("div");
    c.className="card";
    c.onclick=()=>location.href="details.html?id="+i.id;

    c.innerHTML=`<img src="${i.poster_path}">`;
    grid.appendChild(c);
  });
}
}

// ========= DETAILS =========
if(location.pathname.includes("details")){
(async ()=>{
  let id=new URLSearchParams(location.search).get("id");

  let r=await fetch(API+"/details/"+id);
  let d=await r.json();

  document.getElementById("details").innerHTML=`
    <img src="${d.backdrop_path}" width="100%">
    <h2>${d.title}</h2>
    <p>${d.overview}</p>
    <p>⭐ ${d.vote_average}</p>
  `;

  let servers=document.getElementById("servers");

  d.videos.forEach(v=>{
    let b=document.createElement("button");
    b.innerText=v.server;

    b.onclick=async()=>{
      let link=v.link;

      if(link.includes("fasel")){
        let ex=await fetch(API+"/extract?url="+encodeURIComponent(link));
        let links=await ex.json();
        location.href="player.html?url="+links[0];
      }else{
        location.href="player.html?url="+link;
      }
    };

    servers.appendChild(b);
  });
})();
}

// ========= INIT =========
if(document.getElementById("home")){
  loadHome();
}