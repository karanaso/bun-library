import type { Collection, MongoDBCollectionNamespace } from "mongodb";

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

export let db:MongoDBCollectionNamespace;
export let libraryBooks:Collection;

let dbName = 'librarian';
let collection;

if (process.env.NODE_ENV === 'test') {
    dbName = 'test-librarian';
    console.log('<- DB test mode ->');  
}

client.connect()
    .then(() => db = client.db(dbName))
    .then(() => libraryBooks = db.collection('libraryBooks'))