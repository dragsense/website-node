const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')

module.exports = (app) => {

    app.use(express.static(path.join(__dirname, '../..', 'public'), { maxAge: 31557600000 }))
    app.use(favicon(path.join(__dirname, '../..', 'public', 'favicon.ico')))
    app.use(express.static(path.join(__dirname, '../..','dist')));



}
