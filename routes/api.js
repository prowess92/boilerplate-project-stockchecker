'use strict';
const https = require('https');

// In-memory storage for likes (in a real app, you'd use a database)
const likesStorage = {};

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res) {
      // Handle single or multiple stocks
      const stocks = Array.isArray(req.query.stock)
        ? req.query.stock.map(s => s.toLowerCase())
        : [req.query.stock.toLowerCase()];

      const like = req.query.like === 'true' ? 1 : 0;
      const clientIP = req.ip;

      // Initialize storage for stocks if not exists
      stocks.forEach(stock => {
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
      });

      // Function to fetch stock price
      const fetchStockPrice = (stock) => {
        return new Promise((resolve, reject) => {
          const options = {
            hostname: 'stock-price-checker-proxy.freecodecamp.rocks',
            path: `/v1/stock/${stock}/quote`,
            method: 'GET'
          };

          const request = https.request(options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
              data += chunk;
            });

            response.on('end', () => {
              try {
                const stockData = JSON.parse(data);
                resolve({
                  stock: stock.toUpperCase(),
                  price: stockData.latestPrice,
                  likes: likesStorage[stock] ? likesStorage[stock].size : 0
                });
              } catch (error) {
                reject(error);
              }
            });
          });

          request.on('error', (error) => {
            reject(error);
          });

          request.end();
        });
      };

      // Fetch prices for all stocks
      Promise.all(stocks.map(fetchStockPrice))
        .then(stocksData => {
          // Calculate relative likes if two stocks are provided
          if (stocksData.length === 2) {
            const [stock1, stock2] = stocksData;
            const relLikes = stock1.likes - stock2.likes;

            stocksData[0].rel_likes = relLikes;
            stocksData[1].rel_likes = -relLikes;

            // Remove the original likes property
            delete stocksData[0].likes;
            delete stocksData[1].likes;
          }

          // Send response
          res.json({
            stockData: stocksData.length === 1 ? stocksData[0] : stocksData
          });
        })
        .catch(error => {
          console.error('Error fetching stock prices:', error);
          res.status(500).json({
            error: 'Unable to fetch stock prices',
            details: error.message
          });
        });
    });
};