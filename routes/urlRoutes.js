const express = require('express')
const validUrl = require('valid-url')
const shortid = require('shortid')
require("dotenv").config()

const router = express.Router()

const Url = require('../models/Url')

const port = process.env.PORT
const baseUrl = `http:localhost:${port}`

router.post('/shorten', async (req, res) => {
    const { longUrl } = req.body
    if (!validUrl.isUri(baseUrl)) {
        return res.status(401).json('Invalid base URL')
    }
    const urlCode = shortid.generate()
    if (validUrl.isUri(longUrl)) {
        try {
            let url = await Url.findOne({ longUrl })
            if (url) {
                res.json(url)
            } else {
                const shortUrl = baseUrl + '/' + urlCode
                url = new Url({ longUrl, shortUrl, urlCode, date: new Date() })
                await url.save()
                res.json(url)
            }
        } catch (err) {
            console.log(err)
            res.status(500).json('Server Error')
        }
    } else {
        res.status(401).json('Invalid longUrl')
    }
})

module.exports = router