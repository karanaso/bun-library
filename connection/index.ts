import type { Collection, MongoDBCollectionNamespace } from "mongodb";
import { bookTransactions } from "../routes/bookTransactions";

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

export let db: MongoDBCollectionNamespace;
export let libraryBooks: Collection;
export let members: Collection;
export let bookTransactions: Collection;

let dbName = 'librarian';
let collection;

if (process.env.NODE_ENV === 'test') {
    dbName = 'test-librarian';
    console.log('<- DB test mode ->');
}

client.connect()
    .then(() => {
        db = client.db(dbName);
        libraryBooks = db.collection('libraryBooks');
        members = db.collection('members');
        bookTransactions = db.collection('book-transactions');
    })
    .catch(err => {
        console.log('connection error', err)
    });