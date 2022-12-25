const express = require ("express")
const mongoose = require("mongoose")
const Rooms = require("./Dbrooms")
const cors = require("cors");
const Pusher = require("pusher");
const Messages = require("./Db.messages");



const app= express();
const port = process.env.PORT || 5000;
const pusher = new Pusher({
    appId: "1529067",
    key: "617b6a7821f5eaee4af4",
    secret: "e410f8a31f88dc45f8ba",
    cluster: "ap2",
    useTLS: true
  });
 
app.use(express.json());
app.use(cors());


const dbUrl = "dburl"


mongoose.connect(dbUrl);


const db =mongoose.connection;
db.once("open",() =>{
console.log("Db connected sycess");
//    const roomCollection = db.collection("rooms");
//    const changeStream = roomCollection.watch();

//    changeStream.on("change", (change) =>{
//     console.log(change);
//    });


//    const msgCollection = db.collection("messages");
//    const changeStream1 = msgCollection.watch();

//    changeStream1.on("change", (change) =>{
//     console.log(change);
//    });


const roomCollection = db.collection("rooms");
  const changeStream = roomCollection.watch();

  changeStream.on("change", (change) =>{
      console.log(change)
    if(change.operationType === "insert"){
        const roomDetails = change.fullDocument; 
        pusher.trigger("room", "inserted",roomDetails)
       }
       else{
        console.log("Not expected event to trigger");
       }
  })

  const msgCollection = db.collection("messages");
  const changeStream1 = msgCollection.watch();

  changeStream1.on("change", (change) =>{
    console.log(change)
   if(change.operationType === "insert"){
    const messageDetails = change.fullDocument; 
    pusher.trigger("messages", "inserted",messageDetails)
   }
   else{
    console.log("Not expected event to trigger");
   }
  });
 });

app.get("/",(req,res) =>{
    return res.status(200).send("Api working") 
});

app.get("/room/:id", (req, res) => {
    Rooms.find({_id: req.params.id}, (err, data) =>{
        if (err){
            return res.status(500).send(err); 
        }else{
            return res.status(200).send(data[0]);
        }
        
    });
});

app.get("/messages/:id",(req,res)=> {
    Messages.find({roomId:  req.params.id},(err,data)=>{
        if(err){
            return res.status(500).send(err)
        }
        else{
            return res.status(200).send(data)
        }
    });
});

app.post ("/messages/new", (req,res) =>{
    const dbMessages = req.body;
    Messages.create(dbMessages,(err,data) => {
        if (err){
            return res.status(500).send(err);
        }
        else{
            return res.status(201).send(data);
        }
    });
});

app.post("/group/create",(req,res) =>{
    const name = req.body.groupName;
    Rooms.create({name},(err,data) => {
        if(err){
            return res.status(500).send(err);
        }
        else{
            return res.status(201).send(data);
        }
    })
});
app.get("/all/rooms", (req, res) => {
    Rooms.find({}, (err, data) => {
        if (err){
        return res.status(500).send(err);
    }else{
        return res.status(200).send(data);
    }
});
});

app.listen(port, ()=>{
    console.log(`server listean :${port}`)
});
