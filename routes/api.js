'use strict';
const https = require('https');

// In-memory storage for likes (in a real app, you'd use a database)
const likesStorage = {};

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res) {
      const stock = req.query.stock.toLowerCase();
      const like = req.query.like === 'true' ? 1 : 0;
      const clientIP = req.ip;

      // Initialize storage for this stock if not exists
      if (!likesStorage[stock]) {
        likesStorage[stock] = new Set();
      }

      // Check and add like if requested
      if (like === 1) {
        // Only add the like if this IP hasn't already liked the stock
        if (!likesStorage[stock].has(clientIP)) {
          likesStorage[stock].add(clientIP);
        }
      }

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

            // Send response with stock data and likes
            res.json({
              stockData: {
                stock: stock.toUpperCase(),
                price: stockData.latestPrice,
                likes: likesStorage[stock] ? likesStorage[stock].size : 0
              }
            });
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