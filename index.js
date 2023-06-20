let express = require('express');
let app = express();
let mySql = require('mysql');
var bodyParser = require('body-parser');
let crawledData = require('./crawledData');

app.use(bodyParser.json());

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

// If no route is matched by now, it must be a 404

/*app.use(function(req, res, next) {
    res.status(404).send('404 Error. Sorry, page not found');
});*/
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,usertoken,sessiontoken');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});
app.get('/', function(req,res){
    console.log("Hi");
    res.send("Server is running on port 6001")
});          
app.post('/assignment/get-scrapped-data', crawledData.getScrappedData)





