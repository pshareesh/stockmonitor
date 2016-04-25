exports.index = function(req, res){
/*	request("http://finance.yahoo.com/webservice/v1/symbols/YHOO,AAPL/quote?format=json", 
		function(error, response, body){
			console.log(error);
			console.log(body);
	}) */
	res.render('default');
};

exports.about = function(req, res){
	res.send('Hello Hareesh at home');
};
