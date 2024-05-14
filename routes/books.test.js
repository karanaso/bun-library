import { expect, test, describe } from "bun:test";
import { elysia } from '../index.ts';
import { v4 } from 'uuid';

const randomBookId = v4();
const data = {
  id: randomBookId,
  bookId: randomBookId,
  title: 'the title ' + randomBookId,
  author: 'author ' + randomBookId,
};

const postABook = async (params) => await fetch('http://localhost:3000/books', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...data,
    ...params,
  }),
});

describe('books', () => {
  test('POST /books', async () => {
    const response = await postABook();    
    expect(response.status).toBe(201);
  });

  test('/books/:bookId', async () => {
    const id = v4();
    await postABook({ id });
    const response = await fetch('http://localhost:3000/books/' + id);
    expect(response.status).toBe(200);
    
    const rd = await response.json();
    expect(rd.id).toBe(id);
  });

  test('/books?title', async () => {
    const title = 'title'+v4();
    await postABook({ title });
    const response = await fetch('http://localhost:3000/books?title=' + title);
    expect(response.status).toBe(200);
    const rd = await response.json();

    expect(rd.length).toEqual(1);
    expect(rd[0].title).toBe(title);
  });

  test('/books?author', async () => {
    const response = await fetch('http://localhost:3000/books?author=' + data.author);
    expect(response.status).toBe(200);
    const rd = await response.json();

    expect(rd[0].bookId).toBe(data.bookId);
    expect(rd[0].author).toBe(data.author);
  });

  test('PUT /books', async () => {
    //POST a document
    const id = v4();
    const bookId = v4();
    const response1 = await postABook({ id, bookId });
    expect(response1.status).toBe(201);
    
    // Update/PUT the document
    const response2 = await fetch('http://localhost:3000/books', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        author: 'modified author',
      }),
    });
    const data2 = await response2.json();
    expect(data2.modifiedCount).toEqual(1);
    
    // FETCH document to test
    const response = await fetch('http://localhost:3000/books/' + id);
    expect(response.status).toBe(200);
    const rd = await response.json();

    expect(rd.author).toEqual('modified author');
    expect(response2.status).toBe(200);
  });

  test('DELETE /books', async () => {
    //POST a document
    const id = v4();
    const response1 = await postABook({ id });
    expect(response1.status).toBe(201);

    const response2 = await fetch('http://localhost:3000/books/' + id, {
      method: 'DELETE',
    });

    // FETCH document to test
    const response3 = await fetch('http://localhost:3000/books/' + id);  
    const rd = await response3.json();
    expect(response3.status).toBe(404);
  });
});