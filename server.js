// JIGAR AI public starter backend. API secrets stay on the server.
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const app = express();

app.disable("x-powered-by");
app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:"1mb"}));
app.use("/api/", rateLimit({windowMs:60_000,limit:20,standardHeaders:"draft-7",legacyHeaders:false}));
app.use(express.static(__dirname));

const API_KEY = process.env.OPENAI_API_KEY;
const TEXT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

async function callResponses(payload){
  const r=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",
    headers:{"Authorization":`Bearer ${API_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify(payload)
  });
  const data=await r.json();
  if(!r.ok)throw new Error(data.error?.message||"AI provider request failed");
  return data;
}
app.post("/api/chat",async(req,res)=>{
  try{
    if(!API_KEY)return res.status(503).json({error:"AI service is not configured by the site owner yet."});
    const {message,language="en",mode="chat"}=req.body||{};
    if(typeof message!=="string"||!message.trim()||message.length>12000)return res.status(400).json({error:"Enter a message up to 12,000 characters."});
    const instruction=mode==="coding"?"You are JIGAR AI Coding Assistant. Write clear, safe code and explain it.":
      mode==="study"?"You are JIGAR AI Study Helper. Teach clearly, step by step, with examples.":
      "You are JIGAR AI, a helpful general assistant for the public.";
    const data=await callResponses({model:TEXT_MODEL,instructions:`${instruction} Reply in language code/name: ${language}. Be accurate, helpful and safe.`,input:message});
    res.json({reply:data.output_text||"No text response was returned."});
  }catch(e){console.error("chat:",e.message);res.status(502).json({error:"Could not get an AI response. Please try again later."})}
});
app.post("/api/search",async(req,res)=>{
  try{
    if(!API_KEY)return res.status(503).json({error:"AI service is not configured by the site owner yet."});
    const {query,language="en"}=req.body||{};
    if(typeof query!=="string"||!query.trim()||query.length>1500)return res.status(400).json({error:"Enter a search query up to 1,500 characters."});
    const data=await callResponses({model:TEXT_MODEL,instructions:`You are JIGAR AI Search. Use web search to research the query. Summarize in ${language}. Include source references when available and do not invent sources.`,tools:[{type:"web_search_preview"}],input:query});
    const sources=[];
    for(const item of data.output||[])for(const part of item.content||[])for(const a of part.annotations||[])if(a.url)sources.push({title:a.title||a.url,url:a.url});
    res.json({answer:data.output_text||"No search summary was returned.",sources:[...new Map(sources.map(s=>[s.url,s])).values()]});
  }catch(e){console.error("search:",e.message);res.status(502).json({error:"Search is temporarily unavailable."})}
});
app.post("/api/image",async(req,res)=>{
  try{
    if(!API_KEY)return res.status(503).json({error:"AI service is not configured by the site owner yet."});
    const {prompt,size="1024x1024"}=req.body||{};
    if(typeof prompt!=="string"||!prompt.trim()||prompt.length>3000)return res.status(400).json({error:"Enter an image prompt up to 3,000 characters."});
    const allowed=["1024x1024","1536x1024","1024x1536"];
    const r=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers:{"Authorization":`Bearer ${API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:IMAGE_MODEL,prompt:prompt.trim(),size:allowed.includes(size)?size:"1024x1024"})});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error?.message||"Image provider request failed");
    const b64=d.data?.[0]?.b64_json;
    if(!b64)return res.status(502).json({error:"No image was returned."});
    res.json({image:`data:image/png;base64,${b64}`});
  }catch(e){console.error("image:",e.message);res.status(502).json({error:"Image generation is temporarily unavailable."})}
});
app.get("/api/health",(req,res)=>res.json({status:"ok",name:"JIGAR AI"}));
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"index.html")));
const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`JIGAR AI listening on ${port}`));