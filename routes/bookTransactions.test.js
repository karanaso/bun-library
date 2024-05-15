import { expect, test, describe } from "bun:test";
import { elysia } from '../index.ts';
import dayjs from "dayjs";
import { v4 } from 'uuid';

const randomBookId = v4();
const data = {
  id: randomBookId,
  bookId: 'bookId-' + randomBookId,
  memberId: 'memberId-' + randomBookId,
  outDate: new Date().toISOString(),
  dueDate: new Date().toISOString(),
  // returnDate: new Date().toISOString(),
  note: 'note-' + randomBookId,
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
  test('POST /should fail because one of the required fields is not present', async () => {
    const response = await fetch('http://localhost:3000/book-transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(422);
    const d = await response.json();
    console.log(d);
  });

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

  test('DELETE should fail because url does not contain :id', async () => {
    //POST a document
    const id = v4();
    const response1 = await postATransaction({ id });
    expect(response1.status).toBe(201);

    const response2 = await fetch('http://localhost:3000/book-transactions/', {
      method: 'DELETE',
    });
    expect(response2.status).toEqual(404);
  });

  test('DELETE /book-transactions', async () => {
    //POST a document
    const id = v4();
    const response1 = await postATransaction({ id });
    expect(response1.status).toBe(201);

    const response2 = await fetch('http://localhost:3000/book-transactions/' + id, {
      method: 'DELETE',
    });

    // FETCH document to test
    const response3 = await fetch('http://localhost:3000/book-transactions/' + id);
    const rd = await response3.json();
    expect(response3.status).toBe(404);
  });

  test('It should return book transactions for memberId', async () => {
    const randomId = v4();

    const r1 = await postATransaction({ memberId: randomId });
    const r2 = await postATransaction({ memberId: randomId });

    expect(r1.status).toEqual(201);
    expect(r2.status).toEqual(201);

    const response = await fetch('http://localhost:3000/book-transactions?memberId=' + randomId);
    expect(response.status).toBe(200);

    const rs = await response.json();
    expect(rs).toHaveLength(2);
  });

  test('It should return book transactions for a bookId', async () => {
    const randomId = v4();

    const r1 = await postATransaction({ bookId: randomId });
    const r2 = await postATransaction({ bookId: randomId });

    expect(r1.status).toEqual(201);
    expect(r2.status).toEqual(201);

    const response = await fetch('http://localhost:3000/book-transactions?bookId=' + randomId);
    expect(response.status).toBe(200);

    const rs = await response.json();
    expect(rs).toHaveLength(2);
  });

  test('It should return all due/lented books', async () => {
    const randomId = v4();

    const r1 = await postATransaction({ bookId: randomId, dueDate: dayjs().add(1, 'day') });
    const r2 = await postATransaction({ bookId: randomId, dueDate: dayjs().add(1, 'day') });

    expect(r1.status).toEqual(201);
    expect(r2.status).toEqual(201);

    const response = await fetch('http://localhost:3000/book-transactions?due=true');
    expect(response.status).toBe(200);

    const rs = await response.json();
    expect(rs.length).toBeGreaterThan(0);
  });

  test('It should return all due/lented books', async () => {
    const randomId = v4();

    const r1 = await postATransaction({ bookId: randomId, dueDate: dayjs().add(1, 'day') });
    const r2 = await postATransaction({ bookId: randomId, dueDate: dayjs().add(1, 'day') });

    expect(r1.status).toEqual(201);
    expect(r2.status).toEqual(201);

    const response = await fetch('http://localhost:3000/book-transactions?due=true&bookId=' + randomId);
    expect(response.status).toBe(200);

    const rs = await response.json();

    expect(rs.length).toBeGreaterThan(0);
    rs.forEach(item => {
      const dueDate = dayjs(item.dueDate).diff(dayjs());
      expect(dueDate).toBeGreaterThan(0);
    })

  });

  test('It should return the book', async () => {
    const randomId = v4();

    const r1 = await postATransaction({
      id: randomId,
    });
    expect(r1.status).toEqual(201);

    const response = await fetch('http://localhost:3000/book-transactions/return/'+randomId,{ 
      method: 'PUT',
    });
    expect(response.status).toBe(200);

    const response2 = await fetch('http://localhost:3000/book-transactions/' + randomId);
    expect(response.status).toBe(200);
    const data = await response2.json();
    
    expect(data.dueDate).toBeDefined();
  });

  test('It should NOT return the book because the id does not exit in the database', async () => {
    const randomId = v4();

    const r1 = await postATransaction({
      id: randomId,
    });
    expect(r1.status).toEqual(201);

    const response = await fetch('http://localhost:3000/book-transactions/return/non-existing-id',{ 
      method: 'PUT',
    });
    expect(response.status).not.toEqual(404);
  });

  test('It should NOT return the book because the id does not exit', async () => {
    const randomId = v4();

    const r1 = await postATransaction({
      id: randomId,
    });
    expect(r1.status).toEqual(201);

    const response = await fetch('http://localhost:3000/book-transactions/return/',{ 
      method: 'PUT',
    });
    expect(response.status).not.toEqual(200);
  });


});