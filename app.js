const API = "https://ali8537291-server-bot.hf.space";

// 🔥 loader مضبوط
function showLoader(){
  document.getElementById("loader").classList.remove("hidden");
}
function hideLoader(){
  document.getElementById("loader").classList.add("hidden");
}

// ===== MENU =====
function toggleMenu(){
  document.getElementById("menu").classList.toggle("open");
}

function goHome(){
  document.getElementById("results").innerHTML="";
  document.getElementById("home").style.display="block";
  document.getElementById("menu").classList.remove("open");
}

// ===== SEARCH =====
function openSearch(){
  document.getElementById("searchBar").style.display="flex";
}
function closeSearch(){
  document.getElementById("searchBar").style.display="none";
  goHome();
}

// ===== HOME =====
async function loadHome(){
  try{
    showLoader();

    let r = await fetch(API+"/home");
    let d = await r.json();

    hero(d.latest[0]);

    render(d.latest);
    render(d.recommended);

  }catch(e){
    console.log(e);
  }
  hideLoader(); // 🔥 مهم حتى ما يعلق
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
    row.innerHTML += `
      <div class="card" onclick="location.href='details.html?id=${i.id}'">
        <img src="${i.poster_path}">
      </div>
    `;
  });

  home.appendChild(row);
}

// ===== SEARCH FIX 🔥 =====
document.getElementById("searchInput").addEventListener("input", debounce(async(e)=>{
  let q = e.target.value.trim();

  if(q.length < 2){
    goHome();
    return;
  }

  try{
    showLoader();

    let r = await fetch(API+"/search?q="+encodeURIComponent(q));
    let d = await r.json();

    let list = d.search || d;

    let grid = document.getElementById("results");
    grid.innerHTML="";
    document.getElementById("home").style.display="none";

    list.forEach(i=>{
      grid.innerHTML += `
        <div class="card" onclick="location.href='details.html?id=${i.id}'">
          <img src="${i.poster_path}">
        </div>
      `;
    });

  }catch(e){
    console