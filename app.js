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

server.listen(3000);

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
