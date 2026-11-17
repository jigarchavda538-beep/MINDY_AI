const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let language=localStorage.getItem("jigar-language")||"en";
let history=JSON.parse(localStorage.getItem("jigar-history")||"[]");
const translations={
 en:{newChat:"New chat",home:"Home",chat:"AI Chat",search:"AI Search",coding:"AI Coding",image:"AI Image",study:"Study Helper",history:"History",settings:"Settings"},
 gu:{newChat:"નવી ચેટ",home:"હોમ",chat:"AI ચેટ",search:"AI સર્ચ",coding:"AI કોડિંગ",image:"AI ઇમેજ",study:"સ્ટડી હેલ્પ",history:"હિસ્ટ્રી",settings:"સેટિંગ્સ"},
 hi:{newChat:"नई चैट",home:"होम",chat:"AI चैट",search:"AI सर्च",coding:"AI कोडिंग",image:"AI इमेज",study:"स्टडी हेल्प",history:"हिस्ट्री",settings:"सेटिंग्स"}
};
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2300)}
function navigate(page){$$(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("#sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"})}
$$("[data-page]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();navigate(b.dataset.page)}));
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
function setLanguage(){document.documentElement.lang=language;$$("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;if(translations[language][key])el.textContent=translations[language][key]});$("#language").value=language;$("#settingsLanguage").value=language}
$("#language").onchange=e=>{language=e.target.value;localStorage.setItem("jigar-language",language);setLanguage()};
$("#settingsLanguage").onchange=e=>{language=e.target.value};
$("#saveSettings").onclick=()=>{localStorage.setItem("jigar-language",language);localStorage.setItem("jigar-theme",$("#appearance").value);document.body.classList.toggle("light",$("#appearance").value==="light");setLanguage();toast("Settings saved")};
$("#themeToggle").onclick=()=>{document.body.classList.toggle("light");const theme=document.body.classList.contains("light")?"light":"dark";localStorage.setItem("jigar-theme",theme);$("#appearance").value=theme};
if(localStorage.getItem("jigar-theme")==="light")document.body.classList.add("light");
$("#appearance").value=localStorage.getItem("jigar-theme")||"dark";
function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function requestApi(path,payload){const response=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const data=await response.json();if(!response.ok)throw new Error(data.error||"Request failed");return data}
function appendMessage(role,text){const row=document.createElement("div");row.className="chat-line "+role;row.innerHTML=`<div class="who">${role==="user"?"You":"✦"}</div><div class="bubble">${esc(text)}</div>`;$("#messages").append(row);$("#messages").scrollTop=$("#messages").scrollHeight;return row}
async function chat(prompt,mode="chat"){if(!prompt.trim())return;navigate("chat");const empty=$(".empty-chat");if(empty)empty.remove();appendMessage("user",prompt);const pending=appendMessage("assistant","Thinking...");try{const data=await requestApi("/api/chat",{message:prompt,language,mode});pending.querySelector(".bubble").textContent=data.reply||"No response returned.";history.unshift({prompt,reply:data.reply||"",time:new Date().toLocaleString()});history=history.slice(0,35);localStorage.setItem("jigar-history",JSON.stringify(history));renderHistory()}catch(err){pending.querySelector(".bubble").textContent="AI service is not connected yet. The site owner must configure the server API key. "+err.message}}
$("#heroForm").onsubmit=e=>{e.preventDefault();const v=$("#heroInput").value.trim();$("#heroInput").value="";chat(v)};
$("#chatForm").onsubmit=e=>{e.preventDefault();const v=$("#chatInput").value.trim();$("#chatInput").value="";chat(v)};
$$("[data-chat-prompt]").forEach(b=>b.onclick=()=>chat(b.dataset.chatPrompt));
$$("[data-prompt]").forEach(b=>b.onclick=()=>chat(b.dataset.prompt));
$("#newChat").onclick=()=>{$("#clearChat").click();navigate("chat")};
$("#clearChat").onclick=()=>{$("#messages").innerHTML='<div class="empty-chat"><div class="empty-symbol">✧</div><h2>What’s on your mind?</h2><p>Ask a question to start chatting with JIGAR AI.</p></div>'};
$("#searchForm").onsubmit=async e=>{e.preventDefault();const query=$("#searchInput").value.trim();if(!query)return;$("#searchResult").textContent="Searching...";try{const d=await requestApi("/api/search",{query,language});let html=esc(d.answer||"No answer returned.");if(d.sources?.length)html+="<h3>Sources</h3>"+d.sources.map(s=>`<p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title||s.url)}</a></p>`).join("");$("#searchResult").innerHTML=html}catch(err){$("#searchResult").textContent="Search is unavailable: "+err.message}};
$("#codeBtn").onclick=async()=>{const prompt=$("#codePrompt").value.trim();if(!prompt)return;$("#codeResult").textContent="Generating...";try{const d=await requestApi("/api/chat",{message:`Use ${$("#codeLanguage").value}. ${prompt}. Provide readable code and explain it.`,language,mode:"coding"});$("#codeResult").innerHTML="<pre>"+esc(d.reply||"")+"</pre>"}catch(err){$("#codeResult").textContent="Coding assistant is unavailable: "+err.message}};
$("#studyBtn").onclick=async()=>{const prompt=$("#studyPrompt").value.trim();if(!prompt)return;$("#studyResult").textContent="Preparing your study help...";try{const d=await requestApi("/api/chat",{message:prompt,language,mode:"study"});$("#studyResult").textContent=d.reply||"No response returned."}catch(err){$("#studyResult").textContent="Study Helper is unavailable: "+err.message}};
$$("[data-study]").forEach(b=>b.onclick=()=>{$("#studyPrompt").value=b.dataset.study;$("#studyPrompt").focus()});
$("#imageBtn").onclick=async()=>{const prompt=$("#imagePrompt").value.trim();if(!prompt)return;$("#imageResult").textContent="Creating image...";try{const d=await requestApi("/api/image",{prompt,size:$("#imageSize").value});$("#imageResult").innerHTML=`<img src="${d.image}" alt="Generated image"><p><a href="${d.image}" download="jigar-ai-image.png">Download image</a></p>`}catch(err){$("#imageResult").textContent="Image generation is unavailable: "+err.message}};
function renderHistory(){$("#historyList").innerHTML=history.length?history.map((h,i)=>`<div class="history-row"><span>${esc(h.prompt.slice(0,100))}</span><button data-history="${i}">Open →</button></div>`).join(""):'<p class="muted">No chats saved yet.</p>' ;$$("[data-history]").forEach(b=>b.onclick=()=>{const h=history[Number(b.dataset.history)];navigate("chat");$("#messages").innerHTML="";appendMessage("user",h.prompt);appendMessage("assistant",h.reply)})}
$("#clearHistory").onclick=()=>{history=[];localStorage.removeItem("jigar-history");renderHistory();toast("History cleared")};
$("#globalSearch").onkeydown=e=>{if(e.key==="Enter"){navigate("search");$("#searchInput").value=e.target.value;$("#searchForm").requestSubmit()}};
$("#profileBtn").onclick=()=>navigate("settings");
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
setLanguage();renderHistory();