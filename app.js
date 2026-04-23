const API = "https://ali8537291-server-bot.hf.space";

function showLoader(){document.getElementById("loader").style.display="flex";}
function hideLoader(){document.getElementById("loader").style.display="none";}

// ===== MENU =====
function toggleMenu(){
  document.getElementById("menu").classList.toggle("open");
}

// ===== SEARCH UI =====
function openSearch(){
  document.getElementById("searchBar").classList.add("open");
  document.getElementById("searchInput").focus();
}

function closeSearch(){
  document.getElementById("searchBar").classList.remove("open");
  document.getElementById("results").innerHTML="";
  document.getElementById("home").style.display="block";
}

function goHome(){
  closeSearch();
}

// ===== HOME =====
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
  h.innerHTML=`<h2>${i.title || i.name}</h2>`;
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

// ===== SEARCH =====
document.getElementById("searchInput").addEventListener("input", debounce(async(e)=>{
  let q = e.target.value.trim();

  if(q.length < 2){
    document.getElementById("results").innerHTML="";
    return;
  }

  showLoader();

  let r = await fetch(API+"/search?q="+encodeURIComponent(q));
  let d = await r.json();

  let list = d.search || d;

  let grid = document.getElementById("results");
  grid.innerHTML="";
  document.getElementById("home").style.display="none";

  list.forEach(i=>{
    let c=document.createElement("div");
    c.className="card";
    c.onclick=()=>location.href="details.html?id="+i.id;
    c.innerHTML=`<img src="${i.poster_path}">`;
    grid.appendChild(c);
  });

  hideLoader();
},400));

// ===== DETAILS =====
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
        showQualities(links);
      }else{
        location.href="player.html?url="+link;
      }
    };

    s.appendChild(b);
  });

  hideLoader();
})();
}

// ===== QUALITY =====
function showQualities(links){
  let box=document.createElement("div");
  box.className="quality-box";

  links.forEach(l=>{
    let q = "Auto";
    if(l.includes("1080")) q="1080p";
    else if(l.includes("720")) q="720p";
    else if(l.includes("480")) q="480p";
    else if(l.includes("360")) q="360p";

    let b=document.createElement("button");
    b.innerText=q;
    b.onclick=()=>location.href="player.html?url="+l;

    box.appendChild(b);
  });

  document.body.appendChild(box);
}

// ===== UTILS =====
function debounce(fn,delay){
  let t;
  return (...args)=>{
    clearTimeout(t);
    t=setTimeout(()=>fn(...args),delay);
  }
}

// ===== INIT =====
if(document.getElementById("home")){
  loadHome();
}