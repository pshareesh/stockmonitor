var express = require('express');
var fs = require('fs');
var app = express();
var routes = require('./routes');
var request = require("request");
var contents;

app.set('view engine', 'ejs')

app.get('/', routes.index);
app.get('/about', routes.about);

var data = require('./quote.json');
var stockData = [];
for(var i=0; i < data.list.resources.length; i++){

	var stock = new Stock(data.list.resources[i].resource.fields.symbol, data.list.resources[i].resource.fields.price);
	stockData.push(stock);
}
app.locals.appdata = stockData;

function Stock(symbol, price){
	this.symbol = symbol;
	this.price = price;
}



var server = app.listen(3000, function(){
	console.log('Listening on port 3000');
	contents = fs.readFileSync('quote.json', 'utf8');
	console.log(contents);
});