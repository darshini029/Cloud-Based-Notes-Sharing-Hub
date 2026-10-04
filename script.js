let token=localStorage.getItem("cloudnotes_token"), me=JSON.parse(localStorage.getItem("cloudnotes_user")||"null");
let mode="login", notes=[];
const $=id=>document.getElementById(id);
function api(url,opt={}){opt.headers=opt.headers||{}; if(token) opt.headers.Authorization="Bearer "+token; return fetch(url,opt);}
function showPage(page){
  document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));
  $(page).classList.remove("hidden");
  document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
  $("pageTitle").textContent=page==="my"?"My Notes":page==="notes"?"All Notes":page==="favorites"?"Favorites":page==="upload"?"Upload Notes":"Dashboard";
  if(page==="dashboard") loadNotes();
  if(page!=="upload") renderAll();
}
window.showPage=showPage;
function card(n){
  const fav=n.favorites?.some(x=>String(x)===String(me?.id)) || false;
  const own=n.uploader?._id===me?.id;
  return `<article class="note"><div class="note-icon">${n.originalName?.toLowerCase().endsWith(".pdf")?"📕":"📄"}</div><h3>${esc(n.title)}</h3><p><b>${esc(n.subject)}</b> · ${esc(n.category||"Other")}</p><p>${esc(n.description||"No description")}</p><p>By ${esc(n.uploader?.name||"You")} · ${n.downloads||0} downloads</p><div class="note-actions">${n.filePath?`<button class="small" onclick="downloadNote('${n._id}')">Download</button>`:""}<button class="small" onclick="favorite('${n._id}')">${fav?"★":"☆"}</button>${own?`<button class="small danger" onclick="deleteNote('${n._id}')">Delete</button>`:""}</div></article>`;
}
function esc(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
async function loadNotes(){
 const q=$("search")?.value||"", category=$("category")?.value||"";
 const r=await api(`/api/notes?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`);
 if(r.ok){notes=await r.json(); renderAll();}
}
function renderAll(){
 $("notesGrid").innerHTML=notes.length?notes.map(card).join(""):`<p class="muted">No notes found. Upload the first note!</p>`;
 $("recent").innerHTML=notes.slice(0,4).map(card).join("")||`<p class="muted">No notes yet.</p>`;
 const fav=notes.filter(n=>n.favorites?.some(x=>String(x)===String(me?.id)));
 $("favGrid").innerHTML=fav.map(card).join("")||`<p class="muted">No favorite notes yet.</p>`;
 const mine=notes.filter(n=>n.uploader?._id===me?.id);
 $("myGrid").innerHTML=mine.map(card).join("")||`<p class="muted">You haven't uploaded notes yet.</p>`;
 $("totalNotes").textContent=notes.length;
 $("totalDownloads").textContent=notes.reduce((a,n)=>a+(n.downloads||0),0);
 $("totalFavorites").textContent=fav.length;
 $("myNotes").textContent=mine.length;
}
async function downloadNote(id){window.location.href="/api/notes/"+id+"/download?token="+token;}
async function favorite(id){const r=await api("/api/notes/"+id+"/favorite",{method:"POST"});if(r.ok)loadNotes();}
async function deleteNote(id){if(confirm("Delete this note?")){const r=await api("/api/notes/"+id,{method:"DELETE"});if(r.ok)loadNotes();}}
$("search").addEventListener("input",loadNotes); $("category").addEventListener("change",loadNotes);
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".register-only").forEach(x=>x.style.display=mode==="register"?"block":"none");$("authBtn").textContent=mode==="register"?"Create Account":"Login";});
$("authForm").onsubmit=async e=>{e.preventDefault();const body={email:$("email").value,password:$("password").value};if(mode==="register")body.name=$("name").value;const r=await fetch("/api/auth/"+mode,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok){$("authMsg").textContent=d.message;return}token=d.token;me=d.user;localStorage.setItem("cloudnotes_token",token);localStorage.setItem("cloudnotes_user",JSON.stringify(me));start();}
$("noteForm").onsubmit=async e=>{e.preventDefault();const r=await api("/api/notes",{method:"POST",body:new FormData(e.target)});const d=await r.json();$("uploadMsg").textContent=r.ok?"Note uploaded successfully!":d.message;if(r.ok){e.target.reset();loadNotes();setTimeout(()=>showPage("notes"),700);}};
$("logout").onclick=()=>{localStorage.clear();location.reload();};
function start(){ $("auth").classList.add("hidden");$("app").classList.remove("hidden");loadNotes();}
if(token)start();