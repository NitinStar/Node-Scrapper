let express = require('express');
let app = express();
let mySql = require('mysql');

let db = { 
host: '127.0.0.1',
user: 'root',
password: '',
database: 'performance',	
timezone: 'Z',
connectionLimit: 400
}

let pool = mySql.createPool(db);

pool.getConnection(function(err, connection){
if(err || !connection){
 console.log("Conection can't be created");
} else{
	console.log("DB connection has been created === ");
}
});

app.listen('6001', function(err){
	if(err){
		console.log("Server is not listening");
		
	} else{
		console.log("Server is listening at port ", '6001');
	}
});

app.get('/api/getsomedata', function(req, res){
	pool.getConnection(function(err, connection){
if(err || !connection){
 console.log("Conection can't be created");
} else{
	var localQuery = "Select user_id from qee_user where user_gender = 'Female' and is_active=1";
	connection.query(localQuery, function(err, resq){
		if(err || !res){
			res.status(500).send('some error in query == ' + err);
		} else{
			res.send(resq);
		}
	})
}
});
});





