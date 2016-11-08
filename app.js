var express = require('express');
var ejs = require('ejs');
var	app = express();
var router = require("./route/route");

//加载静态
app.use(express.static(__dirname + "/public"));
app.use('/views', express.static(__dirname + '/views'));

//注册引擎模板
app.engine('html', ejs.__express);
app.set('view engine', 'html');
app.use('/', router);

app.listen(3001, function(){    
	console.log('Server is running, port is 3001');
});
