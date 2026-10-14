import { api } from '../client';
import { getFeed } from '../feed';
jest.mock('../client',()=>({api:{get:jest.fn().mockResolvedValue({data:{items:[]}})}}));

it('calls the mounted server feed endpoint',async()=>{
  await getFeed({view:'today'});
  expect(api.get).toHaveBeenCalledWith('/api/feed?view=today');
});
it('keeps equator and prime-meridian coordinates instead of dropping zero',async()=>{
  await getFeed({view:'nearest',lat:0,lng:0});
  expect(api.get).toHaveBeenCalledWith('/api/feed?view=nearest&lat=0&lng=0');
});
