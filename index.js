const express = require("express");
const server = express();
const cors = require('cors');
const mssql = require('mssql');
const md5 = require('crypto-js/md5');
const dotenv = require('dotenv').config()
//Un token de sesiune expira dupa 1 ora
var sessionTokens = new Map();
var productsRoute = require('./Routes/products')
var usersRoute = require('./Routes/users')
var mssqlConfig = {
    database: process.env.SQL_DATABASE,
    server: process.env.SQL_SERVER,
    user: process.env.SQL_USER,
    password: process.env.SQLPASSWORD,
    //driver: "msnodesqlv8",
    options: {
        trustedConnection: true,
        encrypt: true,
        trusServerCertificates: true   
    }
}
var clientURL = process.env.AppUrl || "Some url"
console.log(process.env.SQL_SERVER)

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
//server.use('/products', productsRoute);
server.use('/users', usersRoute)

server.use(express.json());
server.use(express.urlencoded({extended:false}));
const conn =  mssql.connect(mssqlConfig);
///const conn = mssql.connect(mssqlConfig);
server.post('/register' , async (req, res) => {
    //console.log(req.body);
    var users;

    try{

        var conn =  await mssql.connect(mssqlConfig);
        //console.log(conn)
        conn.request()
        .input('Email', mssql.VarChar(60), req.body.email)
        .query('SELECT COUNT(*) as number FROM Users WHERE Email=@Email',  function(err, rows, fields){
            if(err){
                res.status(400);
                res.send();
            }
            //console.log(rows)
            if(rows.recordset[0].number !== 0){
                res.status(409);
                res.send();
            }else{
                users =  conn.request()
                .input('Name', mssql.VarChar(100), req.body.name)
                .input('Email', mssql.VarChar(60), req.body.email)
                .input('Password', mssql.NChar(32), md5(req.body.password))
                .query('INSERT INTO Users (Name, Email, Password) VALUES (@Name, @Email, @Password); Select SCOPE_IDENTITY() as Id', function(err,rows){
                    if(err){
                        //console.log(err);
                        console.log("Err 400");
                        res.status(400)
                        res.send();

                    } 
                    else{
                        var token = Math.random().toString(32).substring(2);
                        res.json({status:201, Id: rows.recordset[0].Id});
                        console.log("Result register")
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
        res.json({status:500});
        res.send();
    }

    
})


server.get('/', (req, res)=> {
    console.log("A intrat in /")
    res.send("Url is " + clientURL);
})
server.post('/login', async (req, res)=>{
    var found = false;
    const {email, password} = req.body;
    console.log("In login ")
    if(!email || !password ){
        res.json({status: 400})
        res.send();

    }
    var conn =  await mssql.connect(mssqlConfig);
    conn.request()
    .input('Email', mssql.VarChar(60), email)
    .input('Password', mssql.VarChar(32), md5(password))
    .query('SELECT Id, Name FROM Users WHERE Email=@Email AND Password=@Password', function(err, rows){
        if(err){
            res.status(400).send();

        }else{
            if(rows.recordset.length !== 0){
                console.log(rows.recordset);
                res.json({name:rows.recordset[0].Name, Id:rows.recordset[0].Id } ).send();
                //res.send();

            }else{
                res.status(404).send();
            }
        }
    })

});
server.get('/products/getAll', async (req, res) => {
    // console.log("In /products/getAll");
    // console.log(req.body);

        var conn =  await mssql.connect(mssqlConfig);
        
        await conn.request().query("SELECT Products.Id, OwnerID, Products.Name as Name,Users.Name as Publisher ,Price, Description, Category  FROM Products INNER JOIN Users ON Products.OwnerID = Users.Id",function(err, rows){
            if(err){
                console.log(err)
                res.json({status:400})
            }else{
                console.log(rows)
                res.json({products:rows.recordset})
                
            }
            
        })
       return;
        
});
server.post("/products/add", async (req, res) => {
    try{
        var conn =  await mssql.connect(mssqlConfig);
        console.log("In adding product")
        conn.request()
            .input('OwnerId', mssql.Int, req.body.ownerId)
            .input('Name', mssql.VarChar(50), req.body.product.name)
            .input('Category', mssql.VarChar(50), req.body.product.category)
            .input('Description', mssql.VarChar(300), req.body.product.description)
            .input('Price', mssql.Float, req.body.product.price)
            .query('INSERT INTO Products (OwnerID, Name, Description, Price, Category) VALUES (@OwnerId, @Name, @Description, @Price, @Category); Select SCOPE_IDENTITY() as Id', async function(err,rows){
                if(err){
                    //console.log(err);
                    console.log("Err 400");
                    res.status(400)
                    res.send();

                } 
                else{
                    var productId = rows.recordset[0].Id;
                    console.log("Product added with id" + productId)

                    var options = req.body.product.activeDeployOptions;
                    var providerId;
                    for(var i = 0 ; i < options.length; i++){
                        var doption = await conn.request()
                                    .input('ProductId', mssql.Int, productId )
                                    .input('ProviderId', mssql.Int, options[i].provider+1)
                                    .input('GitLink', mssql.VarChar(200), options[i].relativePath)
                                    .input('MainTFName', mssql.VarChar(50), options[i].terraformMain)
                                    .input('MainResourceGroup', mssql.VarChar(50), options[i].mainResourceGroup)
                                    .input('MainResourceName', mssql.VarChar(50), options[i].apiResourceName)
                                    .query('INSERT INTO DeployOptions (ProductId, ProviderId, GitLink, MainTFName, MainResourceGroup, MainResourceName) VALUES (@ProductId, @ProviderId, @GitLink, @MainTFName, @MainResourceGroup, @MainResourceName); Select SCOPE_IDENTITY() as Id')
                        console.log("Option " + i + " with  : ");
                        console.log(doption);
                    }   
                    console.log("Result register")
                    //console.log(rows);
                    res.status(201).send();

                }
            });
    }catch(ex){
        console.log(ex)
        res.status(502).send()
    }
})
const port = process.env.PORT || 1337;
var listener = server.listen(port, ()=> {
    console.log("Server started on port " + listener.address().port  )
    console.log("TMP env var is : " )
})