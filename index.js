const express = require("express");
const server = express();
const cors = require('cors');
const mssql = require('mssql');
const md5 = require('crypto-js/md5');
//Un token de sesiune expira dupa 1 ora
var sessionTokens = new Map();
var productsRoute = require('./Routes/products')
var usersRoute = require('./Routes/users')
var mssqlConfig = require('./Configuration/mssql_config');
var clientURL = process.env.AppUrl || "Some url"
const { response } = require("express");

//Cross Origin Resources Sharing
const whiteList = ['http://localhost:3000'];
const corsOptions ={
    origin: (origin, callback) => {
        //console.log(origin)
        if(whiteList.indexOf(origin) !== -1){
            //Daca originea cererii este in whiteList permitem procesarea cererii
            console.log(origin)
            
            callback(null, origin);
        }else{
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
} 
server.use(cors())
server.use('/products', productsRoute);
server.use('/users', usersRoute)

server.use(express.json());
server.use(express.urlencoded({extended:false}));
//let conn =  mssql.connect(mssqlConfig);

server.post('/register' , async (req, res) => {
    //console.log(req.body);
    var users;

    try{

        let conn =  await mssql.connect(mssqlConfig);
        console.log(conn)
        result = await conn.request()
        .input('Email', mssql.VarChar(60), req.body.email)
        .query('SELECT COUNT(*) as number FROM Users WHERE Email=@Email', async function(err, rows, fields){
            if(err){
                res.json({status:400});
                res.send();
            }
            console.log(rows)
            if(rows.recordset[0].number !== 0){
                res.json({status:409});
                res.send();
            }else{
                users = await conn.request()
                .input('Name', mssql.VarChar(100), req.body.name)
                .input('Email', mssql.VarChar(60), req.body.email)
                .input('Password', mssql.NChar(32), md5(req.body.password))
                .query('INSERT INTO Users (Name, Email, Password) VALUES (@Name, @Email, @Password)', function(err,rows){
                    if(err){
                        console.log(err);
                        console.log("Err 400")
                        res.json({status:400});
                        res.send();

                    } 
                    else{
                        var token = Math.random().toString(32).substring(2);
                        res.json({status:201, token});
                        sessionTokens.set(req.body.email, token)
                        console.log(rows);
                        res.send();

                    }
                });
            }
        })
        


        //var toInsertValues = [[req.body.name, req.body.email, md5(req.body.password)]]; 
        
    }
    catch(err){
        console.log(err);
    }

    
})


server.get('/', (req, res)=> {
    res.send("Url is" + clientURL);
})
server.post('/login', async (req, res)=>{
    var found = false;
    const {email, password} = req.body;
    console.log("In login ")
    if(!email || !password ){
        res.json({status: 400})
        res.send();

    }
    let conn =  await mssql.connect(mssqlConfig);
    var response = await conn.request()
    .input('Email', mssql.VarChar(60), email)
    .input('Password', mssql.VarChar(32), md5(password))
    .query('SELECT Name FROM Users WHERE Email=@Email AND Password=@Password', function(err, rows){
        if(err){
            res.status(400).send();

        }else{
            if(rows.recordset.length !== 0){
                console.log(rows.recordset);
                res.json({name:rows.recordset[0].Name} ).send();
                //res.send();

            }else{
                res.status(404).send();
            }
        }
    })
    
    
    

});
const port = process.env.PORT || 1337;
var listener = server.listen(port, ()=> {
    console.log("Server started on port " + listener.address().port  )
    console.log("TMP env var is : " + process.env.TMP)
})