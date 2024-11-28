const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    // Test with one stock
    test('GET /api/stock-prices/ with one stock', function (done) {
        chai.request(server)
            .get('/api/stock-prices/')
            .query({ stock: 'GOOG' })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.property(res.body, 'stockData');
                assert.isObject(res.body.stockData);
                assert.property(res.body.stockData, 'stock');
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.property(res.body.stockData, 'price');
                assert.isNumber(res.body.stockData.price);
                done();
            });
    });

    // Test with one stock and like
    test('GET /api/stock-prices/ with one stock and like', function (done) {
        chai.request(server)
            .get('/api/stock-prices/')
            .query({
                stock: 'GOOG',
                like: true
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.property(res.body, 'stockData');
                assert.isObject(res.body.stockData);
                assert.property(res.body.stockData, 'stock');
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.property(res.body.stockData, 'price');
                assert.isNumber(res.body.stockData.price);
                assert.property(res.body.stockData, 'likes');
                assert.isNumber(res.body.stockData.likes);
                done();
            });
    });
});
