const mongoose = require('mongoose')
const Schema = mongoose.Schema


const URLSchema = new Schema({
    urlCode: String,
    longUrl: String,
    shortUrl: String,
    date: {
        type: String,
        default: Date.now
    },
    counter: {
        type : Number,
        default : 0
    } 
})

module.exports = mongoose.model('Url', URLSchema)