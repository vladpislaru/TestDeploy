const { Router } = require('express');
const express = require('express');
const router = express.Router();   

router.route('/')
.get()
.put()
.post()
.delete()


router.route('/getAll').get();
router.get('/preview', (req, res) => {
    
    if(!req.body?.productId || ! req.body?.clientId || req.body?.deployOption){

    }
})
module.exports = router;