const API = "https://ali8537291-server-bot.hf.space";

function showLoader(){document.getElementById("loader").style.display="flex";}
function hideLoader(){document.getElementById("loader").style.display="none";}

// ========= HOME =========
async function loadHome(){
  showLoader();

  let r = await fetch(API+"/home");
  let d = await r.json();

  hero(d.latest[0]);

  render(d.latest);
  render(d.choosed);
  render(d.recommended);

  hideLoader();
}

function hero(i){
  let h=document.getElementById("hero");
  h.style.backgroundImage=`url(${i.backdrop_path})`;
  h.innerHTML=`<h1>${i.title || i.name}</h1>`;
}

function render(items){
  let home=document.getElementById("home");
  let row=document.createElement("div");
  row.className="row";

  items.forEach(i=>{
    let c=document.createElement("div");
    c.className="card";

    c.onclick=()=>location.href="details.html?id="+i.id;

    c.innerHTML=`<img src="${i.poster_path}">`;
    row.appendChild(c);
  });

  home.appendChild(row);
}

// ========= SEARCH =========
if(document.getElementById("searchBox")){
document.getElementById("searchBox").oninput = debounce(async(e)=>{
  let q=e.target.value;
  if(q.length<2)return;

  showLoader();

  let r=await fetch(API+"/search?q="+q);
  let d=await r.json();

  let list=d.search||d;

  let grid=document.getElementById("results");
  grid.innerHTML="";

  list.forEach(i=>{
    let c=document.createElement("div");
    c.className="card";

    c.onclick=()=>location.href="details.html?id="+i.id;

    c.innerHTML=`<img src="${i.poster_path}">`;
    grid.appendChild(c);
  });

  hideLoader();
},400);
}

// ========= DETAILS =========
if(location.pathname.includes("details")){
(async()=>{
  showLoader();

  let id=new URLSearchParams(location.search).get("id");
  let r=await fetch(API+"/details/"+id);
  let d=await r.json();

  document.getElementById("details").innerHTML=`
    <img src="${d.backdrop_path}" width="100%">
    <h2>${d.title}</h2>
    <p>${d.overview}</p>
  `;

  let s=document.getElementById("servers");

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

    s.appendChild(b);
  });

  hideLoader();
})();
}

// ========= UTILS =========
function debounce(fn,delay){
  let t;
  return (...args)=>{
    clearTimeout(t);
    t=setTimeout(()=>fn(...args),delay);
  }
}

// ========= INIT =========
if(document.getElementById("home")){
  loadHome();
}