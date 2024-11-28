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

    // Test liking the same stock twice
    test('GET /api/stock-prices/ liking the same stock twice', function (done) {
        chai.request(server)
            .get('/api/stock-prices/')
            .query({
                stock: 'GOOG',
                like: true
            })
            .end(function (err, res) {
                const firstLikes = res.body.stockData.likes;

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
                        assert.property(res.body.stockData, 'likes');

                        // Verify likes count didn't increase
                        assert.equal(
                            res.body.stockData.likes,
                            firstLikes,
                            'Likes should not increase on duplicate like'
                        );

                        done();
                    });
            });
    });

    // Test with two stocks
    test('GET /api/stock-prices/ with two stocks', function (done) {
        chai.request(server)
            .get('/api/stock-prices/')
            .query({
                stock: ['MSFT', 'GOOG'],
                like: true
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.property(res.body, 'stockData');
                assert.isArray(res.body.stockData);
                assert.equal(res.body.stockData.length, 2);

                // Check first stock
                assert.isObject(res.body.stockData[0]);
                assert.property(res.body.stockData[0], 'stock');
                assert.oneOf(res.body.stockData[0].stock, ['MSFT', 'GOOG']);
                assert.property(res.body.stockData[0], 'price');
                assert.isNumber(res.body.stockData[0].price);
                assert.property(res.body.stockData[0], 'rel_likes');
                assert.isNumber(res.body.stockData[0].rel_likes);

                // Check second stock
                assert.isObject(res.body.stockData[1]);
                assert.property(res.body.stockData[1], 'stock');
                assert.oneOf(res.body.stockData[1].stock, ['MSFT', 'GOOG']);
                assert.property(res.body.stockData[1], 'price');
                assert.isNumber(res.body.stockData[1].price);
                assert.property(res.body.stockData[1], 'rel_likes');
                assert.isNumber(res.body.stockData[1].rel_likes);

                // Verify relative likes are opposite
                assert.equal(
                    res.body.stockData[0].rel_likes,
                    -res.body.stockData[1].rel_likes
                );

                done();
            });
    });

    // Test with two stocks and like
    test('GET /api/stock-prices/ with two stocks and like', function (done) {
        chai.request(server)
            .get('/api/stock-prices/')
            .query({
                stock: ['MSFT', 'GOOG'],
                like: true
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.property(res.body, 'stockData');
                assert.isArray(res.body.stockData);
                assert.equal(res.body.stockData.length, 2);

                // Check first stock
                assert.isObject(res.body.stockData[0]);
                assert.property(res.body.stockData[0], 'stock');
                assert.oneOf(res.body.stockData[0].stock, ['MSFT', 'GOOG']);
                assert.property(res.body.stockData[0], 'price');
                assert.isNumber(res.body.stockData[0].price);
                assert.property(res.body.stockData[0], 'rel_likes');
                assert.isNumber(res.body.stockData[0].rel_likes);

                // Check second stock
                assert.isObject(res.body.stockData[1]);
                assert.property(res.body.stockData[1], 'stock');
                assert.oneOf(res.body.stockData[1].stock, ['MSFT', 'GOOG']);
                assert.property(res.body.stockData[1], 'price');
                assert.isNumber(res.body.stockData[1].price);
                assert.property(res.body.stockData[1], 'rel_likes');
                assert.isNumber(res.body.stockData[1].rel_likes);

                // Verify relative likes are opposite
                assert.equal(
                    res.body.stockData[0].rel_likes,
                    -res.body.stockData[1].rel_likes
                );

                done();
            });
    });
});
