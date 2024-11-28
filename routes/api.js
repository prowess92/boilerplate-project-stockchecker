'use strict';
const https = require('https');

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res) {
      const stock = req.query.stock.toLowerCase();
      const like = req.query.like === 'true' ? 1 : -1;

      const options = {
        hostname: 'stock-price-checker-proxy.freecodecamp.rocks',
        path: `/v1/stock/${stock}/quote`,
        method: 'GET'
      };

      const request = https.request(options, (response) => {
        let data = '';

        // A chunk of data has been received.
        response.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received.
        response.on('end', () => {
          try {
            const stockData = JSON.parse(data);
            //console.log(stockData)
            // Send response in the expected format

            if (req.query.like === 'true') {
              res.json({
                stockData: {
                  stock: stock.toUpperCase(),
                  price: stockData.latestPrice,
                  likes: like
                }
              });
            } else {
              res.json({
                stockData: {
                  stock: stock.toUpperCase(),
                  price: stockData.latestPrice
                }
              });
            }
          } catch (error) {
            // Handle parsing errors
            res.status(500).json({
              error: 'Unable to parse stock price',
              details: error.message
            });
          }
        });
      });

      // Handle any errors with the request
      request.on('error', (error) => {
        console.error('Error fetching stock price:', error);
        res.status(500).json({
          error: 'Unable to fetch stock price',
          details: error.message
        });
      });

      // End the request
      request.end();
    });

};