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

describe('books', () => {


  test('POST /books', async () => {
    const response = await fetch('http://localhost:3000/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    expect(response.status).toBe(200);
  });

  test('/books/:bookId', async () => {
    const response = await fetch('http://localhost:3000/books/' + data.bookId);
    expect(response.status).toBe(200);
    const rd = await response.json();

    expect(rd.bookId).toBe(data.bookId);
    expect(rd.title).toBe(data.title);
  });

  test('/books?title', async () => {
    const response = await fetch('http://localhost:3000/books?title=' + data.title);
    expect(response.status).toBe(200);
    const rd = await response.json();

    expect(rd.length).toEqual(1);
    expect(rd[0].bookId).toBe(data.bookId);
    expect(rd[0].title).toBe(data.title);
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
    const response1 = await fetch('http://localhost:3000/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookId: v4(),
        ...data
      }),
    });

    expect(response1.status).toBe(200);
    const data1 = await response1.json();

    // Update/PUT the document
    const response2 = await fetch('http://localhost:3000/books', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data1,
        author: 'modified author',
      }),
    });
    const data2 = await response2.json();
    expect(data2.modifiedCount).toEqual(1);

    // FETCH document to test
    const response = await fetch('http://localhost:3000/books/' + data1.bookId);
    expect(response.status).toBe(200);
    const rd = await response.json();

    expect(rd.author).toEqual('modified author');
    expect(response2.status).toBe(200);
  });

  test.only('DELETE /books', async () => {
    //POST a document
    const response1 = await fetch('http://localhost:3000/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: v4(),
      }),
    });
    expect(response1.status).toBe(200);
    const data1 = await response1.json();
    const response2 = await fetch('http://localhost:3000/books/' + data1.id, {
      method: 'DELETE',
    });
    // FETCH document to test
    const response3 = await fetch('http://localhost:3000/books/' + data1.id);  
    expect(response3.status).toBe(404);
  });
});