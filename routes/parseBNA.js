const express = require('express');
const parseBNA = require('../parsers/parseBNA');

var router = express.Router();

router.post('/', async (req, res, next) => {
    const result = await parseBNA(req.body.username, req.body.password, req.body.accountNumber);
    res.json(result);
});

module.exports = router;