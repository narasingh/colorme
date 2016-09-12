var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io',{ rememberTransport: false}).listen(server);
var userCount = 0;
var colorObj = {
	r: 0,
	g: 0,
	b: 0
};

//server.listen(3000, '0.0.0.0');
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
server.listen(server_port, server_ip_address, function(){
		console.log('listening on ' + server_port);
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
app.get('/colorme', function(req, res){
	res.sendfile(__dirname + '/view.html');
});

io.sockets.on('connection', function (socket) {
	this.emit('color', {color: colorObj});
	this.emit('load');
	userCount++;
	this.emit('news', { count: userCount });

	socket.on('disconnect', function (socket) {
		userCount--;
		console.log('gone');
		io.sockets.emit('news', { count: userCount });
	});

	socket.on('add', function(data) {
		var color = data.color;
		if (colorObj[color] == 255) return;
		colorObj[color] = colorObj[color] + 1;
		io.sockets.emit('color', {color: colorObj});
	});

	socket.on('minus', function(data) {
		var color = data.color;
		if (colorObj[color] == 0) return;
		colorObj[color] = colorObj[color] - 1;
		io.sockets.emit('color', {color: colorObj});
	});

	socket.on("stop", function(isStop){
		if(isStop){
			io.sockets.emit('stopwatch', isStop);
		}
	});
});
