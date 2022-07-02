const { Router } = require('express');
const express = require('express');
const router = express.Router();   
const childProccess = require("child_process")
const { DefaultAzureCredential } = require("@azure/identity");
const azure = require("@azure/arm-appservice")
const mssql = require('mssql/msnodesqlv8');
var mssqlConfig = require('../Configuration/mssql_config');

router.get('/getAll',  async(req, res) => {
    // console.log("In /products/getAll");
    // console.log(req.body);

        let conn = await mssql.connect(mssqlConfig);
        console.log(conn)
        await conn.request().query("SELECT Products.Id, OwnerID, Products.Name as Name,Users.Name as Publisher ,Price, Description, Category  FROM Products INNER JOIN Users ON Products.OwnerID = Users.Id",
            function(err, rows){
                if(err){
                    res.json({status:400});
                    res.send();
                }
                console.log(rows)
                res.json({products:[]}).send();
            })

    

});
router.get('/preview', async  (req, res) => {
    //===========Verificarea stadard a informatiilor necesare===========
    if( !req.body.userid  || !req.body.productid || !req.body.optionid || !req.body.username){
            res.json({status:400})
            res.send();
    }else{
        let conn =  await mssql.connect(mssqlConfig);
        
        await conn.request()
        .input('Email', mssql.VarChar(60), req.body.email)
        .query('SELECT COUNT(*) as number FROM Users WHERE Email=@Email', async function(err, rows, fields){
            
        
        })
    }


    //============================CAZ de testare SPECIAL ==> Deploy pe AZURE ======================================================


    // const appHandler =  new azure.WebSiteManagementClient(new DefaultAzureCredential(), "69f6e4bc-aa47-4437-b693-9c58bdeb03df");
    // const appURL = await appHandler.webApps.get("rg-linux-0ols", "app-linux-0ols")
    // console.log(appURL.hostNames[0])



    //===================================================================================================================================================================================================
    // var response = await childProccess.exec("cd WORKSPACE && dir",(err, stdout, stderr) =>{
    //     console.log(stdout);
        
    // }); 
    


    // var response = await childProccess.exec("cd WORKSPACE\\user1021 && git clone https://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@github.com/vladpislaru/gitTest2.git", async (err, stdout, stderr) =>{
    //     console.log(stdout);
    //     console.log(err);
    //     response = stdout;
        
        
    //     //console.log(url)

    //     console.log("abia aici am ajuns")
    //     // if(!req.body?.productId || ! req.body?.clientId || req.body?.deployOption){
    //     res.send({message:"Success"})
    // })
    
     
})
module.exports = router;