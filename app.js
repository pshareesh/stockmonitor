var express = require('express');
var bodyParser = require("body-parser");
var fs = require('fs');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var routes = require('./routes');
var request = require("request");
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

//app.get('/', routes.index);
app.get('/', function(req, res){
	initialize();
	res.render('default');
});

app.get('/about', routes.about);

app.post('/save',function(req,res){
  var symbol=req.body.symbol;
  var price=req.body.price;
  console.log("Symbol = "+symbol+", price is "+price);
  updatePrice(symbol, price);
  var jData = JSON.stringify(stockData);
  console.log('stocks now=' + JSON.stringify(stockData));
  console.log('jData=' + jData);
  	fs.writeFile('data.json', jData, function(error) {
     if (error) {
       console.error("write error:  " + error.message);
     } else {
     	initialize();
       console.log("Successful Write");
     }
	});
  res.send(stockData);
});

app.post('/add',function(req,res){
  var symbol=req.body.symbol;
  var price=req.body.price;
  console.log("Symbol = "+symbol+", price is "+price);
  addPrice(symbol, price);
  var jData = JSON.stringify(stockData);
  console.log('stocks now=' + JSON.stringify(stockData));
  console.log('jData=' + jData);
  	fs.writeFile('data.json', jData, function(error) {
     if (error) {
       console.error("write error:  " + error.message);
     } else {
     	initialize();
       console.log("Successful Write");
     }
	});
  res.end("yes");
});

app.post('/delete',function(req,res){
  var symbol=req.body.symbol;
  console.log("Symbol = "+symbol);
  deleteStock(symbol);
  var jData = JSON.stringify(stockData);
  console.log('jData=' + jData);
  	fs.writeFile('data.json', jData, function(error) {
     if (error) {
       console.error("write error:  " + error.message);
     } else {
     	initialize();
       console.log("Successful Write");
     }
	});
  res.send(stockData);
});

var qData = require('./quote.json');
var quoteMap = new Object();
var data = require('./data.json');
var stockData = [];
var stockSymbols =[];

function initializeQuotes(){
	var symbolString = '';
	console.log('getting quotes for stocks:' + stockSymbols.length);
	for(var i=0; i < stockSymbols.length; i++){
		symbolString = symbolString.concat(stockSymbols[i]);
		if(i < stockSymbols.length - 1)
			symbolString = symbolString.concat(',');
	}
	console.log('symbolString = ' + symbolString);
	request('http://finance.yahoo.com/webservice/v1/symbols/' + symbolString + '/quote?format=json', 
		function(error, response, body){
			console.log(error);
		//	console.log(body);
			fs.writeFile('quote.json', body, function(error) {
		     if (error) {
		       console.error("quote write error:  " + error.message);
		     } else {
		       console.log("Successful Write");
		     }
		 	});
	});

	for(var i=0; i < qData.list.resources.length; i++){
		var price = qData.list.resources[i].resource.fields.price;
		quoteMap[qData.list.resources[i].resource.fields.symbol] = price.substring(0,5);
	}
}

function initialize(){
	stockData.length =0;
	data = require('./data.json');
	stockSymbols.splice(0,stockSymbols.length);
	for(var i=0; i < data.length; i++){
		stockSymbols.push(data[i].symbol);
	}
	initializeQuotes();
	for(var i=0; i < data.length; i++){
		var stock = new Stock(data[i].symbol, data[i].alert_price);
		stock.price = quoteMap[data[i].symbol];
		stockData.push(stock);
		console.log("Stock: " + stock.symbol + " alert:" + stock.alert_price);
	}
	app.locals.appdata = stockData;
	console.log("total stocks initialized = " + stockData.length);
}

app.locals.appdata = stockData;

function Stock(symbol, alertPrice){
	this.symbol = symbol;
	this.alert_price = alertPrice;
	this.price = 0;
}

function updatePrice(symbol, aPrice){
	for(var i=0; i < stockData.length; i++){

		console.log('checking for stock ' + stockData[i].symbol + ' ' + symbol);
		if(stockData[i].symbol === symbol){
			stockData[i].alert_price = aPrice;
			break;
		}
	}
}

function addPrice(symbol, aPrice){
		console.log('Adding stock ' + symbol + ' ' + aPrice);
		var newStock = new Stock(symbol, aPrice);
		stockData.push(newStock);
}

function deleteStock(symbol){
	var sIndex;
	for(var i=0; i < stockData.length; i++){
		if(stockData[i].symbol === symbol){
			sIndex =i;
			break;
		}
	}
	stockData.splice(sIndex,1);

}

var server = app.listen(3000, function(){
	console.log('Listening on port 3000');
	initialize();
	
});