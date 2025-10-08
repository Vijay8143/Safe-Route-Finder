const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
	// Proxy only API and websocket/auth endpoints; leave static assets to the dev server.
	app.use(
		'/api',
		createProxyMiddleware({
			target: 'http://localhost:5000',
			changeOrigin: true,
		})
	);

	app.use(
		['/auth', '/socket.io'],
		createProxyMiddleware({
			target: 'http://localhost:5000',
			changeOrigin: true,
			ws: true,
		})
	);
};
