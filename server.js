require("dotenv").config();
const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const path=require("path");

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

app.use("/api/auth",require("./routes/auth"));
app.use("/api/notes",require("./routes/notes"));

app.get("/api/health",(req,res)=>res.json({status:"ok",service:"CloudNotes"}));
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

const PORT=process.env.PORT||3000;
const uri=process.env.MONGODB_URI;

async function start(){
  if(uri){
    try { await mongoose.connect(uri); console.log("MongoDB connected"); }
    catch(e){ console.error("MongoDB connection failed:",e.message); }
  } else console.log("No MONGODB_URI set. UI will load, but database features need MongoDB.");
  app.listen(PORT,()=>console.log(`CloudNotes running on http://localhost:${PORT}`));
}
start();