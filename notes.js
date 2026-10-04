const express = require("express");
const multer = require("multer");
const path = require("path");
const Note = require("../models/Note");
const auth = require("../middleware/auth");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req,file,cb) => cb(null,"uploads/"),
  filename: (req,file,cb) => cb(null, Date.now()+"-"+Math.random().toString(36).slice(2)+path.extname(file.originalname))
});
const upload = multer({
  storage,
  limits:{fileSize:10*1024*1024},
  fileFilter:(req,file,cb)=>{
    const ok=[".pdf",".doc",".docx",".ppt",".pptx",".txt"].includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Only PDF, Word, PowerPoint and text files are allowed"), ok);
  }
});

router.get("/", auth, async (req,res)=>{
  try {
    const q=(req.query.q||"").trim();
    const category=req.query.category||"";
    const filter={};
    if(q) filter.$or=[{title:new RegExp(q,"i")},{subject:new RegExp(q,"i")},{description:new RegExp(q,"i")}];
    if(category) filter.category=category;
    const notes=await Note.find(filter).populate("uploader","name").sort({createdAt:-1});
    res.json(notes);
  } catch(e){res.status(500).json({message:"Could not load notes"});}
});

router.post("/", auth, upload.single("file"), async (req,res)=>{
  try {
    const {title,subject,category,description}=req.body;
    if(!title || !subject) return res.status(400).json({message:"Title and subject are required"});
    const note=await Note.create({
      title,subject,category,description,
      fileName:req.file?.filename||"",
      originalName:req.file?.originalname||"",
      filePath:req.file?.path||"",
      fileSize:req.file?.size||0,
      uploader:req.user.id
    });
    res.json(note);
  } catch(e){res.status(400).json({message:e.message||"Upload failed"});}
});

router.get("/:id/download", auth, async (req,res)=>{
  try {
    const note=await Note.findById(req.params.id);
    if(!note || !note.filePath) return res.status(404).send("File not found");
    note.downloads++; await note.save();
    res.download(path.resolve(note.filePath), note.originalName || note.fileName);
  } catch(e){res.status(404).send("File not found");}
});

router.post("/:id/favorite", auth, async (req,res)=>{
  const note=await Note.findById(req.params.id);
  if(!note) return res.status(404).json({message:"Note not found"});
  const i=note.favorites.findIndex(x=>String(x)===String(req.user.id));
  if(i>=0) note.favorites.splice(i,1); else note.favorites.push(req.user.id);
  await note.save(); res.json({favorite:i<0});
});

router.delete("/:id", auth, async (req,res)=>{
  const note=await Note.findOne({_id:req.params.id,uploader:req.user.id});
  if(!note) return res.status(404).json({message:"Note not found or not yours"});
  await note.deleteOne(); res.json({message:"Note deleted"});
});

module.exports = router;