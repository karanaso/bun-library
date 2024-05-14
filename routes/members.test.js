import { expect, test, describe } from "bun:test";
import { elysia } from '../index.ts';
import { v4 } from 'uuid';

const randomMemberId = v4();
const data = {
  id: randomMemberId,
  memberId: randomMemberId,
  firstName: 'firstName ' + randomMemberId,
  lastName: 'lastName ' + randomMemberId,
};

const postAMember = async (params) => await fetch('http://localhost:3000/members', {
  method: 'POST',
headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...data,
    ...params,
  }),
});

describe('members', () => {
  test('POST /members', async () => {
    const response = await postAMember();    
    expect(response.status).toBe(201);
  });

  test('/members/:memberId', async () => {
    const id = v4();
    await postAMember({ id });
    const response = await fetch('http://localhost:3000/members/' + id);
    expect(response.status).toBe(200);
    
    const rd = await response.json();
    expect(rd.id).toBe(id);
  });

  test('/members?firstName', async () => {
    const firstName = 'firstname '+v4();
    await postAMember({ firstName });
    const response = await fetch('http://localhost:3000/members?firstName='+firstName);
    
    expect(response.status).toBe(200);
    const rd = await response.json();
    
    expect(rd.length).toEqual(1);
    expect(rd[0].firstName).toBe(firstName);
  });

  test('/members?lastName', async () => {
    const lastName = 'lastName '+v4();
    await postAMember({ lastName });
    const response = await fetch('http://localhost:3000/members?lastName=' + lastName);
    expect(response.status).toBe(200);
    const rd = await response.json();

    expect(rd[0].lastName).toBe(lastName);
  });

  test('PUT /members', async () => {
    //POST a document
    const id = v4();
    const response1 = await postAMember({ id });
    expect(response1.status).toBe(201);
    
    // Update/PUT the document
    const response2 = await fetch('http://localhost:3000/members', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        firstName: 'modified firstName',
      }),
    });
    const data2 = await response2.json();
    expect(data2.modifiedCount).toEqual(1);
    
    // FETCH document to test
    const response = await fetch('http://localhost:3000/members/' + id);
    expect(response.status).toBe(200);
    const rd = await response.json();

    expect(rd.firstName).toEqual('modified firstName');
    expect(response2.status).toBe(200);
  });

  test('DELETE /members', async () => {
    //POST a document
    const id = v4();
    const response1 = await postAMember({ id });
    expect(response1.status).toBe(201);

    const response2 = await fetch('http://localhost:3000/members/' + id, {
      method: 'DELETE',
    });

    // FETCH document to test
    const response3 = await fetch('http://localhost:3000/members/' + id);  
    const rd = await response3.json();
    expect(response3.status).toBe(404);
  });
});