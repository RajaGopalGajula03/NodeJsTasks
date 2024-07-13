const express = require("express");
const app = express();

app.get("/",(req,res)=>{
    res.send("Hello World!")
});

app.get("/date",(req,res)=>{
    let date = new Date();
    res.send(`Today date is ${date}`);
})

app.get("/page",(req,res)=>{
    res.sendFile("./index.html",{root: __dirname});
})

app.listen(4444);