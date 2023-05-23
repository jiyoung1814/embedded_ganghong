const express = require('express');
const router = express.Router();

const web = require('./web/index');
const arduino = require('./arduino/index');

router.use('/web', web);
router.use('/arduino', arduino);

module.exports = router;