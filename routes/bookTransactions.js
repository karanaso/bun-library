import { Elysia, t } from 'elysia';
import { bookTransactions } from '../connection';


export const bookTransactionsController = new Elysia({
  prefix: "/book-transactions",
  tags: ['book-transactions'],
})
  .get("/", async cx => {
    let searchOptions = {};
    if (cx.query.memberId) searchOptions.memberId = cx.query.memberId;
    if (cx.query.bookId) searchOptions.bookId = cx.query.bookId;
    if (cx.query.due) searchOptions.dueDate = {
      "$gte": new Date().toISOString().substring(0, 10)
    };

    searchOptions = {
      $and: [
        searchOptions
      ]
    };
    
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
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .post('/', async cx => {
    const response = await bookTransactions.insertOne(cx.body);
    cx.set.status = 201;
    return response;
  }, {
    body: t.Object({
      id: t.String(),
      bookId: t.String(),
      memberId: t.String(),
      outDate: t.String(),
      dueDate: t.String(),
      returnDate: t.Optional(t.Date()),
      note: t.Optional(t.String()),
    })
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
  .put('/return/:id', async cx => {
    let response;
    try {
      response = await bookTransactions.updateOne(
        {
          id: cx.params.id
        },
        {
          $set: {
            dueDate: new Date().toISOString()
          }
        },
        {
          upsert: false
        }
      );
    } catch (e) {
      console.error(e);
    }

    return response;
    
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .delete('/:id', async cx => {
    return await bookTransactions.deleteOne({
      id: cx.params.id
    });
  }, {
    params: t.Object({
      id: t.String()
    })
  }).onError(cx => {
    console.error(cx.error);
    return cx.error;
  })

