import { Elysia } from 'elysia';
import { bookTransactions } from '../connection';


export const bookTransactionsController = new Elysia({ prefix: "/book-transactions" })
  .get("/", async cx => {
    const searchOptions = {};
    
    const _bookTransactions = await bookTransactions.find(searchOptions).toArray();
    if (!_bookTransactions) cx.set.status = 404;
    
    return _bookTransactions;
  })
  .get("/:id", async cx => {
    
    const member = await bookTransactions.findOne({
      id: cx.params.id
    });
    if (!member) cx.set.status = 404;
    return member;
  })
  .post('/', async cx => {
    const response = await bookTransactions.insertOne(cx.body);
    cx.set.status = 201;
    return response;
  })
  .put('/', async cx => {
    let response = {};
    const query = {
      id: cx.body.id
    };
    const data = {
      ...cx.body
    };
    delete data._id;
    
    try {
      response = await bookTransactions.updateOne(
        query,
        {
          $set: data
        },
        {
          upsert: false
        }
      );
    } catch (e) {
      console.error(e);
    }
    return response;
  })
  .delete('/:id', async cx => {
    const z =  await bookTransactions.deleteOne({
      id: cx.params.id
    })

    return z;
  })
  
