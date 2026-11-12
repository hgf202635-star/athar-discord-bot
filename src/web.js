const express = require("express");
const session = require("express-session");
const crypto = require("node:crypto");
const path = require("node:path");
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const APP_URL = (process.env.APP_URL || "").replace(/\/$/, "");
const SESSION_SECRET = process.env.SESSION_SECRET;
const redirectUri = () => `${APP_URL}/auth/callback`;
app.use(session({ name:"athar.sid", secret:SESSION_SECRET || crypto.randomBytes(32).toString("hex"), resave:false, saveUninitialized:false, cookie:{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:604800000} }));
app.get("/auth/discord",(req,res)=>{
 if(!CLIENT_ID || !CLIENT_SECRET || !APP_URL || !SESSION_SECRET) return res.status(503).send("إعداد تسجيل الدخول غير مكتمل في استضافة أثر.");
 const state=crypto.randomBytes(24).toString("hex"); req.session.oauthState=state;
 const q=new URLSearchParams({client_id:CLIENT_ID,response_type:"code",redirect_uri:redirectUri(),scope:"identify guilds",state});
 res.redirect(`https://discord.com/oauth2/authorize?${q.toString()}`);
});
app.get("/auth/callback",async(req,res)=>{
 try {
  if(!req.query.code || !req.query.state || req.query.state!==req.session.oauthState) return res.status(400).send("تعذر التحقق من تسجيل الدخول. حاول مجدداً.");
  delete req.session.oauthState;
  const tokenRes=await fetch("https://discord.com/api/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:CLIENT_ID,client_secret:CLIENT_SECRET,grant_type:"authorization_code",code:String(req.query.code),redirect_uri:redirectUri()})});
  const token=await tokenRes.json(); if(!tokenRes.ok || !token.access_token) throw new Error("OAuth token exchange failed");
  req.session.discordAccessToken=token.access_token;
  const me=await discordGet("/users/@me",token.access_token); req.session.discordUser=me;
  res.redirect("/servers.html");
 } catch(e) { console.error("Discord OAuth:",e); res.status(500).send("فشل تسجيل الدخول. تحقق من إعدادات OAuth2 في Discord Developer Portal."); }
});
async function discordGet(endpoint,token){const r=await fetch("https://discord.com/api/v10"+endpoint,{headers:{Authorization:"Bearer "+token}});if(!r.ok)throw new Error("Discord API "+r.status);return r.json();}
app.get("/api/me",async(req,res)=>{
 if(!req.session.discordAccessToken)return res.status(401).json({authenticated:false});
 try { const guilds=await discordGet("/users/@me/guilds",req.session.discordAccessToken);
  const allowed=guilds.filter(g=>{const p=BigInt(g.permissions);return (p&0x20n)!==0n || (p&0x8n)!==0n;}).map(g=>({id:g.id,name:g.name,icon:g.icon}));
  res.json({authenticated:true,user:req.session.discordUser,guilds:allowed});
 } catch(e){console.error(e);req.session.destroy(()=>{});res.status(401).json({authenticated:false});}
});
app.post("/auth/logout",(req,res)=>req.session.destroy(()=>res.json({ok:true})));
const files=new Set(["index.html","servers.html","dashboard.html"]);
app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"..","index.html")));
app.get("/:file",(req,res,next)=>files.has(req.params.file)?res.sendFile(path.join(__dirname,"..",req.params.file)):next());
app.listen(PORT,()=>console.log("Athar web listening on "+PORT));
