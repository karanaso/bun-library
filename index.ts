import { Elysia } from 'elysia'
import swagger from '@elysiajs/swagger';
import { jwt } from '@elysiajs/jwt'
import { cors } from '@elysiajs/cors'
import { fileLogger } from "@bogeychan/elysia-logger";

import { rootController } from './routes/root';
import { booksController } from './routes/books';
import { membersController } from './routes/members';
import { jwtDecode } from 'jwt-decode';
import { bookTransactionsController } from './routes/bookTransactions';

const port = 3000;
export const elysia = new Elysia()
  .state('version', '1.00')
  .use(swagger())
  .use(
    fileLogger({
      file: "./logs/app.log",
      autoLogging: true,
    })
  )
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_TOKEN || ' a random token lorem ipsum',
  }))
  .use(cors())
  .get('/sign/:name', async ({ jwt, params }) => {
    const signed = await jwt.sign({
      a: 1,
      b: 2,
      name: params.name
    })

    return {
      status: 'ok',
      signed
    }
  })
  // .onBeforeHandle( async cx => console.log('rootController onBeforeHandle', await cx.jwt.verify(cx.headers.a)))
  .use(rootController)
  // .onBeforeHandle(cx => console.log('booksController onBeforeHandle'))
  .use(booksController)
  .use(membersController)
  .use(bookTransactionsController)
  .listen(port);