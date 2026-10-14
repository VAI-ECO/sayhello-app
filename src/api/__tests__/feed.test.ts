import { api } from '../client';
import { getFeed } from '../feed';
import { deviceTzOffsetMinutes } from '../../lib/feed-model';
jest.mock('../client',()=>({api:{get:jest.fn().mockResolvedValue({data:{items:[]}})}}));

beforeEach(() => (api.get as jest.Mock).mockClear());

it('calls the mounted server feed endpoint, pages by 100 and sends the viewer clock',async()=>{
  await getFeed({view:'today',tzOffsetMinutes:420});
  expect(api.get).toHaveBeenCalledWith('/api/feed?view=today&tz_offset_minutes=420&limit=100');
});
it('keeps equator and prime-meridian coordinates instead of dropping zero',async()=>{
  await getFeed({view:'nearest',lat:0,lng:0,tzOffsetMinutes:0});
  expect(api.get).toHaveBeenCalledWith('/api/feed?view=nearest&lat=0&lng=0&tz_offset_minutes=0&limit=100');
});
it('sends the type filter so the server cuts it before the page',async()=>{
  await getFeed({view:'today',types:['hootza','special'],tzOffsetMinutes:-300});
  expect(api.get).toHaveBeenCalledWith('/api/feed?view=today&types=hootza%2Cspecial&tz_offset_minutes=-300&limit=100');
});
it('defaults the offset to this device (never the server zone)',async()=>{
  await getFeed({view:'today'});
  expect(api.get).toHaveBeenCalledWith(`/api/feed?view=today&tz_offset_minutes=${deviceTzOffsetMinutes()}&limit=100`);
});
it('reads exactly one server-sized page when asked, continuing from a cursor',async()=>{
  (api.get as jest.Mock).mockResolvedValueOnce({data:{view:'newest',items:[{id:'c'}],count:1,hasMore:true,nextCursor:'c2'}});
  const res = await getFeed({view:'newest',tzOffsetMinutes:0,singlePage:true,cursor:'c1'});
  expect(api.get).toHaveBeenCalledTimes(1);
  expect(api.get).toHaveBeenCalledWith('/api/feed?view=newest&tz_offset_minutes=0&cursor=c1');
  expect(res.data?.nextCursor).toBe('c2');
});
it('follows the cursor so the first page is never presented as the whole feed',async()=>{
  (api.get as jest.Mock)
    .mockResolvedValueOnce({data:{view:'newest',items:[{id:'a'}],count:1,hasMore:true,nextCursor:'c1'}})
    .mockResolvedValueOnce({data:{view:'newest',items:[{id:'b'}],count:1,hasMore:false,nextCursor:null}});
  const res = await getFeed({view:'newest',tzOffsetMinutes:0});
  expect(res.data?.items.map((i)=>i.id)).toEqual(['a','b']);
  expect((api.get as jest.Mock).mock.calls[1][0]).toContain('cursor=c1');
});
