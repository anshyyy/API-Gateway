const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const { PORT } = require('./config/serverConfig');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5
})

const setUpandStart = async () => {


    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({ extended: true }));
    app.use(morgan('combined'));
    app.use(limiter);

    app.use('/bookingService', async (req, res, next) => {
        console.log(req.headers['x-access-token']);
        try {
            const response = await axios.get('http://localhost:3009/api/v1/isauthenticated', {
                headers: {
                    'x-access-token': req.headers['x-access-token']
                }
            });
            if (response.data.success == true) {
                console.log("You are authenticated");
                next();
            } 
        } catch (error) {
            console.log("You are not authenticated to visit this page.");
            return res.status(404).json({
                message:"You are not authenticated to visit this page",
                success : false,
            })
        }

    });

    app.get('/home',async(req,res)=>{
               return res.status(201).json({
                message:"Ok"
               });
    })


    app.use('/bookingService', createProxyMiddleware({ target: 'http://localhost:3002/', changeOrigin: true }))
    app.use('/authService', createProxyMiddleware({ target: 'http://localhost:3009/', changeOrigin: true }))
    app.use('/SearchService', createProxyMiddleware({ target: 'http://localhost:3005/', changeOrigin: true }))
    app.use('/emailRemainderService', createProxyMiddleware({ target: 'http://localhost:3001/', changeOrigin: true }))
     

    app.listen(PORT, () => {
        console.log(`Server Started at ${PORT} `);
    });

}

setUpandStart()
