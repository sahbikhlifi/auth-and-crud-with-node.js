var _ = require('lodash');	
var nodemailer = require('nodemailer');
require('dotenv').config();

var config = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
};
    
var transporter = nodemailer.createTransport(config);

var defaultMail = {
    from: 'khlifisahbi@gmail.com',
    subject: 'Activation account',
};

module.exports = function(mail){
  
    mail = _.merge({}, defaultMail, mail);
    
    transporter.sendMail(mail, function(error, info){
        if(error) return console.log(error);
        console.log('mail sent:', info.response);
    });
};