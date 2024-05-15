import { Elysia,t } from 'elysia';
import { bookTransactions } from '../connection';


export const bookTransactionsController = new Elysia({
  prefix: "/book-transactions",
  tags: ['book-transactions'],
}).get("/", async cx => {
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
  },{
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
  .delete('/:id', async cx => {
    return await bookTransactions.deleteOne({
      id: cx.params.id
    });
  },{
    params: t.Object({
      id: t.String()
    })
  }).onError( cx => {
    console.error(cx.error);
    return cx.error;
  })

