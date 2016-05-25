// set up ======================================================================
var express  = require('express');
var app      = express(); 								// create our app w/ express
var mongoose = require('mongoose'); 					// mongoose for mongodb			
var fs = require("fs");
var path = require('path'); 
var multer = require('multer');
var port = process.env.PORT || 8080;

// configuration ===============================================================

mongoose.connect('mongodb://localhost:27017/ExpenseDb'); 	// connect to mongoDB database
app.configure(function() {
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
	app.use(express.logger('dev')); 						// log every request to the console
	app.use(express.bodyParser()); 							// pull information from html in POST
	app.use(express.methodOverride()); 						// simulate DELETE and PUT
	/*app.use(multer({dest:path.join(__dirname,'/public/uploads/')}));*/
});

	// application -------------------------------------------------------------
	app.get('/', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
	var exp = mongoose.model('exp', {
		Id : Number,
		Amount : Number,
		Date : String,
		Invoice : Buffer,
		ApprovalStatus : String,
		ApprovalStatusId :Number,
		Approver :String,
		ApproverId :String,
		Category :String,
		ChargeToClient :Boolean,
		Project :String,
		Reason :String,
		UserId :String,
		UserName :String,
		Currency :String
	});
app.get('/api/save', function(req, res) {
		exp.find(function(err, expenses) {
			if (err)
				res.send(err)
			res.json(expenses); 
		});
	});
app.post('/api/save', function(req, res) {
	console.log(req.body);
	console.log(req.files.file.name);
    console.log(req.files.file.path);
    console.log(req.files.file.type);
    var userID = req.body.Id;
    app.use(multer({dest:path.join(__dirname,'/public/uploads/',userID)}));

   	   var file = __dirname + "/public/uploads/" +userID+"/"+req.files.file.name;
   	   console.log("fileObj",file);
	   fs.readFile( req.files.file.path, function (err, data) {
	        fs.writeFile(file, data, function (err) {
	         if( err ){
	              console.log( err );
	         }else{
	               response = {
	                   message:'File uploaded successfully',
	                   filename:req.files.file.name
	              };
	          }
	          console.log( response );
	          res.end( JSON.stringify( response ) );
	       });
	   });
		exp.create({
			Id : req.body.Id,
			Amount : req.body.Amount,
			Date : req.body.Date,
			Invoice : req.body.Invoice,
			ApprovalStatus : req.body.ApprovalStatus,
			ApprovalStatusId : req.body.ApprovalStatusId,
			Approver : req.body.Approver,
			ApproverId : req.body.ApproverId,
			Category :	req.body.Category,
			ChargeToClient : req.body.ChargeToClient,
			Project : req.body.Project,
			Reason : req.body.Reason,
			UserId:	req.body.UserId,
			UserName : req.body.UserName,
			Currency : req.body.Currency
		}, function(err, expense) {
			if (err)
				res.send(err);
			exp.find(function(err, expenses) {
				if (err)
					res.send(err)
				res.json(expenses);
			});
		});

	});
app.get('/api/save/:expId', function(req, res) {
	exp.findOne({ Id : req.params.expId }, function(err, expenses) {
		if (err)
			res.send(err)
		res.json(expenses);
	});
});
app.put('/api/update/:expId', function(req, res) {
	exp.update({ Id : req.params.expId },{
		Category : req.body.Category,
		Date : req.body.Date,
		Amount : req.body.Amount,
		Project : req.body.Project,
		ChargeToClient : req.body.ChargeToClient,
		Reason : req.body.Reason 
	}, {safe:true}, function(err, expenses) {
		if (err)
			res.send(err)
		res.json(expenses);
	});
});
app.put('/api/updateStatus/:expId', function(req, res) {
	console.log(req.body);
	exp.update({ Id : req.params.expId },{
		ApprovalStatus : req.body.value,
		ApprovalStatusId : req.body.approvalStatusId
	}, {safe:true}, function(err, expenses) {
		if (err)
			res.send(err)
		res.json(expenses);
	});
});
var history = mongoose.model('history',{
	ExpenseId: Number,
	UpdatedById: Number,
	UpdatedByFullName: String,
	UpdatedOn: String,
	Notes: String
})
app.get('/api/history/:expId', function(req, res) {
	history.find({ ExpenseId : req.params.expId }, function(err, histories) {
		if (err)
			res.send(err)
		res.json(histories);
	});
});
app.post('/api/history/:expenseID', function(req, res) {
	console.log("updatehis",req.body);
	history.create({ ExpenseId : req.params.expenseID,
		UpdatedById : req.body.UpdatedById,
		UpdatedByFullName :req.body.UpdatedByFullName,
		UpdatedOn : req.body.UpdatedOn,
		Notes : req.body.Notes
	},function(err, histories) {
		if (err)
			res.send(err)
		res.json(histories);
	});
});
var users = mongoose.model('users', {
	Id : String,
	Role : String,
	FullName :String,
	Password :String
});
app.get('/api/login', function(req, res) {
		users.find(function(err, users) {
			if (err)
				res.send(err)
			res.json(users); 
		});
});
// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
