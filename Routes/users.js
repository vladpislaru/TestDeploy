const { Router } = require('express');
const express = require('express');
const router = express.Router();   

router.route('/')
.get()
.put()
.post()
.delete()


router.route('/getAll').get();

module.exports = router;