const express = require('express');
const path = require('path');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const app = express();
const port = 4444;
const bcrypt = require('bcrypt');
const { get } = require('jquery');
const dbPath = path.join(__dirname,"goodreads.db");
var jwt = require('jsonwebtoken');
const Token = require('./middleware/token'); 

app.use(express.json())

let db = null;

const initializeDBAndServer = async()=>{
    try{
        db = await open({
            filename: dbPath,
            driver:sqlite3.Database,
        })
        app.listen(port,(req,res)=>{
            console.log(`DB started \nserver running at ${port}`)
        })
    }
    catch(error)
    {
        console.log(`Internal error ${error.message}`);
        process.exit(1);
    }
}

initializeDBAndServer();

app.get("/books",async(req,res)=>{
    let jwtToken;
    try{
        const authHeader = req.headers["authorization"];
        if(authHeader !== undefined)
        {
            jwtToken = authHeader.split(" ")[1];
        }
        if(jwtToken === undefined)
        {
            return res.status(400).send("Invalid Token");
        }
        else
        {
            jwt.verify(jwtToken,"MY_SECRET_TOKEN",async(err,payload)=>{
                if(err)
                {
                    return res.status(401).send("Invalid Access Token",err.message);
                }
                else
                {
                    try{
                        const getBooksQuery = `select * from books Order by id`;
                        const booksArray  = await db.all(getBooksQuery);
                        res.send(booksArray);
                    }
                    catch(error)
                    {
                        console.log("Books DB error",error.message);
                        res.status(500).send("ineternal Server Error");
                    }
                }
            })
        }
    }
    catch(e)
    {
        console.log('Books',e.message);
        res.status(500).send('Inetrnal server Error');
    }
})

app.get("/books/:bookId",Token,async(req,res)=>{
    const {bookId} = req.params;
    const getBookQuery=`select * from books where id = ${bookId};`;
    const book = await db.get(getBookQuery);
    res.send(book);
})

// add book api

app.post("/add-book",async(req,res)=>{
    try{
        const bookDetails = req.body;
    const {
        id,
        title,
        authorId,
        rating,
        ratingCount,
        reviewCount,
        description,
        pages,
        dateOfPublication,
        editionLanguage,
        price,
        onlineStores} = bookDetails;

        const addBookQuery = `INSERT INTO books (id,
        title,
        authorId,
        rating,
        ratingCount,
        reviewCount,
        description,
        pages,
        dateOfPublication,
        editionLanguage,
        price,
        onlineStores)
        VALUES
        (
        ${id},
        '${title}',
        ${authorId},
        ${rating},
        ${ratingCount},
        ${reviewCount},
        '${description}',
        ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
        ${price},
        '${onlineStores}'        
        );`; 
        const book = await db.run(addBookQuery);
        res.status(201).json({message:`Book Added Successfully with id of ${book.lastID}`});
    }
    catch(error)
    {
        console.log("add-book",error.message);
        res.status(500).send("Internal Server Error");
    }
})

// update book api

app.put("/book/:bookId",async(req,res)=>{
    const{bookId} = req.params;
    const{id} = req.body;
    try{
        const updateQuery = `UPDATE books SET id = '${id}' where id = ${bookId}`;
        const book = await db.run(updateQuery);
        res.status(200).json({message:`Book updated Successfullt with book Id ${bookId}`}).send(book);
    }
    catch(err)
    {
        console.log("books",err.message);
        res.status(500).send("Internal Server Error")
    }
})

// delete book

app.delete("/book/:bookId",async(req,res)=>{
    const {bookId} = req.params;
    try{
        const deleteQuery = `DELETE FROM books where id = ${bookId}`;
        const book = await db.run(deleteQuery);
        res.status(200).json({message:`Book Deleted Successfully with book id of ${bookId}`}).send(book);
    }
    catch(err)
    {
        console.log("delete",err.message);
        res.status(500).send("Internal Server Error");
    }
})

// get Author books

app.get("/book/:authorId/books",Token,async(req,res)=>{
    const {authorId} = req.params;
    try{
        const getAuthorBooksQuery = `SELECT * FROM books where authorId = ${authorId};`;
        const book = await db.all(getAuthorBooksQuery);
        res.status(200).send(book);
    }
    catch(e)
    {
        console.log("author",e.message);
        res.status(500).send("Inetrnal Server Error");
    }
})

// filters api
app.get("/filters", async (request, response) => {
    const {
      offset = 0,
      limit = 2,
      order = "ASC",
      order_by = 'id',
      search_q = "",
    } = request.query;
    console.log(search_q,limit,offset,order,order_by);
    try{
        const getBooksQuery = `
      SELECT
        *
      FROM
       books
      WHERE
       title LIKE '%${search_q}%'
      ORDER BY ${order_by} ${order}
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)};`;
    const booksArray = await db.all(getBooksQuery);
    response.status(200).send(booksArray); 

    }catch(error)
    {
        console.log("filters",error.message);
        res.status(500).send("Internal Server Error")
    }
  }); 

//   Register new user
app.post("/register",async(req,res)=>{
    const {username,email,password,gender,location} = req.body;
    try{
            if(password.length < 8)
            {
                res.status(400).send("Password Must be atleast 8 charactes long.");
            }
            const hashedPassword = await bcrypt.hash(`${password}`,10);
            const getUserQuery = `SELECT * FROM users where email = '${email}'`;
            const isUserExits = await db.get(getUserQuery);
            if(isUserExits === undefined)
            {
                const createUserQuery = `Insert Into users(username,email,password,gender,location)
                Values
                (
                '${username}',
                '${email}',
                '${hashedPassword}',
                '${gender}',
                '${location}'
                );`;
                const userData = await db.run(createUserQuery);
                const newUserId = userData.lastID;
                res.status(200).send(`Created new user with Id ${newUserId}`);
            }
            else
            {
                console.log("user alreay exists")
                res.status(400).send("User already exists")
            }
        }
    catch(error)
    {
        console.log("register",error.message);
        res.status(500).send("Internal Server Error");
    }
})

// login api
app.post("/login",async(req,res)=>{
    const{email,password} = req.body;
    const getUserEmailQuery = `SELECT * FROM users where email = '${email}'`;
    try{
        
        const isUserExits = await db.get(getUserEmailQuery);
        if(isUserExits === undefined)
        {
            console.log("user not exists");
            res.status(400).send("Invalid User\n user not Exist");
        }
        else
        {
            
            const isPasswordMatched = await bcrypt.compare(password,isUserExits.password);
            if(isPasswordMatched === true)
            {
                const payload = {
                    email: email,
                };
                const jwtToken  = jwt.sign(payload,"MY_SECRET_TOKEN");
                // res.send(jwtToken);
                res.send(`Hi ${isUserExits.username} Login Successful \n ${jwtToken}`);
            }
            else
            {
                res.status(400).send("Invalid Password");
                console.log("Invalid password");
            }
        }
    }
    catch(err)
    {
        console.log("login",err.message);
        res.status(500).send("Internal Server Error");
    }
})

// change password api

app.put("/change-password",async(req,res)=>{
    const{email,oldPassword,newPassword} = req.body;
    const getUserEmailQuery = `SELECT * FROM users where email = '${email}'`;
    try{
        const isUserExits = await db.get(getUserEmailQuery);
        if(isUserExits === undefined)
        {
            console.log("user not exists");
            return res.status(400).send("Invalid User\n user not Exist");
        }
        else
        {
            
            const isPasswordMatched = await bcrypt.compare(oldPassword,isUserExits.password);
            if(isPasswordMatched === true)
            {
                if(newPassword.length < 5)
                    {
                        console.log("newPassword is too short");
                        return res.status(400).send("Password is too short")
                    }
                if(oldPassword === newPassword)
                {
                    console.log("New Password must be different from he old password");
                    return res.status(400).send("New Password must be different from he old password ")
                }
                else
                {
                    const hashedPassword = await bcrypt.hash(newPassword,10);
                    const passwordUpdateQuery = `update users set password = '${hashedPassword}' where email = '${email}';`;
                    await db.run(passwordUpdateQuery);
                    return res.status(200).send(`Password updated Successfully `)
                } 
            }
            else
            {
                console.log("Invalid Current password");
                return res.status(400).send("Invalid Current Password");
            }
        }        
    }
    catch(err)
    {
        console.log("change-password",err.message);
        return res.status(500).send("Internal Server Error")
    }
})