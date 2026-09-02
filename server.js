import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';

const app=express();
const server=http.createServer(app);
const wss=new WebSocketServer({server});
const clients=new Set();
app.use(express.json());
app.use(express.static('.'));
wss.on('connection',ws=>{clients.add(ws);ws.on('close',()=>clients.delete(ws));});
app.post('/chat', (req,res)=>{const {author,text}=req.body||{};if(!author||!text)return res.status(400).json({error:'author and text required'});const msg={author:String(author).slice(0,40),text:String(text).slice(0,200),at:Date.now()};for(const ws of clients)if(ws.readyState===1)ws.send(JSON.stringify({type:'chat',...msg}));res.json({ok:true});});
app.get('/health',(_,res)=>res.json({ok:true,clients:clients.size}));
const port=process.env.PORT||3000;server.listen(port,()=>console.log(`IQ Live running on http://localhost:${port}`));
