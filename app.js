var express = require('express');
var path = require('path');
var logger = require('morgan');

var parseBNARouter = require('./routes/parseBNA');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/parseBNA', parseBNARouter);

module.exports = app;
