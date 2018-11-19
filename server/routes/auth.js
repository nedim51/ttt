const express = require('express');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const db = require('../data/db');
const md5 = require("md5");

var app = module.exports = express.Router();

function createToken(user) {
    return jwt.sign(_.omit(user, 'password'), "secret world", { expiresIn: '1440m' });
}

app.post('/login', function (req, res) {
    if (!req.body.login || !req.body.password) return res.send({ success: false, message: "Введите логин и/или пароль!" });
    var user = _.find(users, { login: req.body.login });
    if (!user) return res.send({ success: false, message: "Ошибка в логине или пароле!" });
    if (!(user.password === req.body.password)) return res.send({ success: false, message: "Ошибка в логине или пароле!" });
    res.send({
        success: true, id_token: createToken(user)
    });
});

app.post('/reg', function (req, res) {
    db.person.findOne({ raw: true, where: { login: req.body.user.login } }).then(data => {
        if (data) {
            return res.send({ success: false, message: "Логин занят!" })
        }
            db.person.build({
                name: req.body.user.name,
                surname: req.body.user.surname,
                login: req.body.user.login,
                password: md5(req.body.user.password),
                email: req.body.user.email,
                score: 0,
                level: 0,
                win: 0,
                lose: 0,
                draw: 0
            }).save();
            console.log(req.body.user);
            return res.send({ success: true, id_token: createToken(req.body.user) });
    });
});