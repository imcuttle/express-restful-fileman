module.exports = {
  setUp: function(app) {
    /* app is an express server object. */
    // http://localhost:8082/test
    app.use('/fileman', require('./browser-view/example/filemanMiddleware'))
  }
}
