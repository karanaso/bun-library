import { Elysia, NotFoundError } from 'elysia';
import { libraryBooks } from '../connection';
import { ObjectId } from 'mongodb';

export const booksController = new Elysia({ prefix: "/books" })
  .get("/", async cx => {
    const searchOptions = {};
    if (cx.query.bookId) searchOptions.bookId = parseInt(cx.query.bookId);
    if (cx.query.title) searchOptions.title = { $regex: cx.query.title, $options: "i" };
    if (cx.query.author) searchOptions.author = { $regex: cx.query.author, $options: "i" };

    const books = await libraryBooks.find(searchOptions).toArray();
    return books;
  })
  .get("/:bookId", async cx => {
    const book = await libraryBooks.findOne({
      bookId: cx.params.bookId
    });
    if (!book) throw new Error('not-found');

    return book;
  })
  .post('/', async cx => {
    const book = cx.body;
    await libraryBooks.insertOne(book);
    return book;
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
      response = await libraryBooks.updateOne(
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
  .delete('/:id', cx => {
    console.log('query id to be deleted', cx.params.id);
    return libraryBooks.deleteOne({
      id: cx.params.id
    })
  })
  .onError(cx => {
    const error = cx.error.toString();
    if (error === 'Error: not-found') {
      cx.set.status = 404
      return 'Not Found :('
    }

    return cx
  })
