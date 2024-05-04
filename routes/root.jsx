import { Elysia, t } from 'elysia';

export const rootController = new Elysia({ prefix: "/welcome" })
  .get('/', async cx => {
    Bun.file('dist/index.html');
  }) 
  .get('/:id', cx => {
    return cx.params.id;
  })
