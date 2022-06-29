const { Router } = require('express');
const express = require('express');
const router = express.Router();   
const childProccess = require("child_process")
const { DefaultAzureCredential } = require("@azure/identity");
const azure = require("@azure/arm-appservice")
router.route('/')
.get()
.put()
.post()
.delete()


router.route('/getAll').get();
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