// Prepare necessary pre-requisites
const express = require('express');
const os = require("os");
// var mongo = require('mongodb'); 
const { MongoClient } = require('mongodb');
const http = require('http');

// Collect database settings from environment variables
const mongoHost = "mongodb-arm64";
const mongoPort = "27017";
const mongoAdminDatabase = "admin";
const mongoDatabase = "airbnb";
const mongoCollection = "chicago_listings";
const mongoUser = "root";
const mongoPassword = "abc123";

// Build MongoDB connection string
//================================
// Used for OpenShift environment
var url = "mongodb://" + mongoUser + ":" + mongoPassword + "@" + mongoHost + ":" + mongoPort + "/" + mongoAdminDatabase
// Used for local testing
// var url = "mongodb://localhost:27017/airbnb"
console.log("MongoDB instance is at: " + url)

// Set Express.js to listen for all connections
const app = express();
const port = 8080;
const hostname = "0.0.0.0";

// Function to clean up the entries from a HTTP query (destringify)
function destringify(query) {
    if (query.model) query.model = parseInt(query.model);
    if (query.sockets) query.sockets = parseInt(query.sockets);
    if (query.coresPerSocket) query.coresPerSocket = parseInt(query.coresPerSocket);
    if (query.totalCores) query.totalCores = parseInt(query.totalCores);
    if (query.frequencyGHz) query.frequencyGHz = parseFloat(query.frequencyGHz);
    return query;
}

// Basic response on /
app.get('/', (req, res) => {
    res.send("ok");
})

// Searches performance collection using query modifier from HTTP query
app.get('/findall', (req, res) => {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("connection created");
    async function findall(findQuery) {
        var result = ""
        try {
            await client.connect();
            console.log("connected");
            const collection = client.db(mongoDatabase).collection(mongoCollection);
            console.log("collection set");
            findQuery = destringify(findQuery);
            console.log("query is: " + JSON.stringify(findQuery));
            result = await collection.find(findQuery).toArray();
            console.log("search completed");
        } finally {
            await client.close();
            console.log("client closed");
        }
        console.log("returning result:");
        console.log(result);
        res.send(result);
    }
    findall(req.query).catch(console.dir);
})

// Healthcheck on /healthz
app.get('/healthz', (req, res) => {
    res.send('ok');
})

// Shows the URL of the MongoDB instance
app.get('/url', (req, res) => {
    res.send(url);
})

// Deploy web server and log status
app.listen(port, hostname, () => {
    console.log(`MongoDB app listening at http://${hostname}:${port}`)
})

//async function listDatabases(client){
//    databasesList = await client.db().admin().listDatabases();
 
//    console.log("Databases:");
//    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
//}

//async function main(){
//    const uri = "mongodb+srv://root:abc123@172.30.134.34/airbnb?retryWrites=true&w=majority";
    
//    const client = new MongoClient(uri);
 
//    try {
        // Connect to the MongoDB cluster
//        await client.connect();
 
        // Make the appropriate DB calls
//        await  listDatabases(client);
 
//    } catch (e) {
//        console.error(e);
//    } finally {
//        await client.close();
//    }
//}

//main().catch(console.error);
