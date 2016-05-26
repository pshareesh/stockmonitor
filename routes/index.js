exports.index = function(req, res){
	
	res.render('default');
};

exports.about = function(req, res){
	res.send('Hello Hareesh at home');
};
