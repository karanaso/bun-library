import { expect, test, describe } from "bun:test";
import { elysia } from '../index.ts';
import { v4 } from 'uuid';

const randomBookId = v4();
const data = {
  id: randomBookId,
  bookId: 'bookId-'+randomBookId,
  memberId: 'memberId-'+randomBookId,
  outDate: new Date().toISOString,
  dueDate: new Date().toISOString,
  note: 'note-'+randomBookId,
};

const postATransaction = async (params) => await fetch('http://localhost:3000/book-transactions', {
  method: 'POST',
headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...data,
    ...params,
  }),
});

describe('book-transactions', () => {
  test('POST /book-transactions', async () => {
    const response = await postATransaction();    
    expect(response.status).toBe(201);
  });

  test('/book-transactions/:id', async () => {
    const id = v4();
    await postATransaction({ id });
    const response = await fetch('http://localhost:3000/book-transactions/' + id);
    expect(response.status).toBe(200);
    
    const rd = await response.json();
    expect(rd.id).toBe(id);
  });

  test('PUT /book-transactions', async () => {
    //POST a document
    const id = v4();
    const response1 = await postATransaction({ id });
    expect(response1.status).toBe(201);

    // Update/PUT the document
    const response2 = await fetch('http://localhost:3000/book-transactions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        note: 'a modified note',
      }),
    });
    
    const data2 = await response2.json();
    expect(data2.modifiedCount).toEqual(1);
    // FETCH document to test
    const response = await fetch('http://localhost:3000/book-transactions/' + id);
    expect(response.status).toBe(200);
    const rd = await response.json();

    expect(rd.note).toEqual('a modified note');
    expect(response2.status).toBe(200);
  });

  test('DELETE /book-transactions', async () => {
    //POST a document
    const id = v4();
    const response1 = await postATransaction({ id });
    expect(response1.status).toBe(201);

    const response2 = await fetch('http://localhost:3000/book-transactions/' + id, {
      method: 'DELETE',
    });
    console.log(id);
    // FETCH document to test
    const response3 = await fetch('http://localhost:3000/book-transactions/' + id);  
    const rd = await response3.json();
    expect(response3.status).toBe(404);
  });
});