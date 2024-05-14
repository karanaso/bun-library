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
  .get("/:id", async cx => {
    const book = await libraryBooks.findOne({
      id: cx.params.id
    });
    if (!book) cx.set.status = 404;
    return book;
  })
  .post('/', async cx => {
    const response = await libraryBooks.insertOne(cx.body);
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
  .delete('/:id', async cx => {
    const z =  await libraryBooks.deleteOne({
      id: cx.params.id
    })

    return z;
  })
  
