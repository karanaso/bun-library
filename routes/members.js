import { Elysia, NotFoundError } from 'elysia';
import { members, libraryBooks} from '../connection';


export const membersController = new Elysia({ 
  prefix: "/members",
  tags: ['members']
}).get("/", async cx => {
    const searchOptions = {};
    if (cx.query.memberId) searchOptions.memberId = cx.query.memberId;
    if (cx.query.firstName) searchOptions.firstName = { $regex: cx.query.firstName, $options: "i" };
    if (cx.query.lastName) searchOptions.lastName = { $regex: cx.query.lastName, $options: "i" };
    
    const _members = await members.find(searchOptions).toArray();
    if (!_members) cx.set.status = 404;
    
    return _members;
  })
  .get("/:id", async cx => {
    
    const member = await members.findOne({
      id: cx.params.id
    });
    if (!member) cx.set.status = 404;
    return member;
  })
  .post('/', async cx => {
    const response = await members.insertOne(cx.body);
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
      response = await members.updateOne(
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
    const z =  await members.deleteOne({
      id: cx.params.id
    })

    return z;
  })
  
