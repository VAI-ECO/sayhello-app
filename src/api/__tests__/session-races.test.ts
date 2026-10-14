import { api, setUnauthorizedHandler } from '../client';
import * as SecureStore from 'expo-secure-store';
jest.mock('expo-secure-store',()=>({
  getItemAsync:jest.fn().mockResolvedValue(null),
  setItemAsync:jest.fn().mockResolvedValue(undefined),
  deleteItemAsync:jest.fn().mockResolvedValue(undefined),
}));
function deferred<T>() {
  let resolve!: (value:T)=>void;
  const promise=new Promise<T>(done=>{resolve=done;});
  return {promise,resolve};
}
beforeEach(async()=>{
  await api.clearToken();
  jest.clearAllMocks();
  global.fetch=jest.fn();
});

it('ignores a stale startup read after a newer sign-in',async()=>{
  const read=deferred<string|null>();
  (SecureStore.getItemAsync as jest.Mock).mockReturnValueOnce(read.promise);
  const loading=api.init();
  await Promise.resolve();
  await api.setToken('new-session');
  read.resolve('old-session');
  await loading;
  (fetch as jest.Mock).mockResolvedValueOnce({ok:true,json:async()=>({user:{id:'new-user'}})});
  await api.user.getProfile();
  expect(fetch).toHaveBeenCalledWith(expect.any(String),expect.objectContaining({headers:expect.objectContaining({Authorization:'Bearer new-session'})}));
});

it.each([true,false])('discards a stale response (success=%s) without clearing the new account',async ok=>{
  const reply=deferred<unknown>();
  const unauthorized=jest.fn();
  setUnauthorizedHandler(unauthorized);
  await api.setToken('old-session');
  (fetch as jest.Mock).mockReturnValueOnce(reply.promise);
  const pending=api.user.getProfile();
  await api.setToken('new-session');
  reply.resolve({ok,status:ok?200:401,json:async()=>({user:{id:'old-user'},message:'Expired'})});
  const result=await pending;
  expect(result.data).toBeUndefined();
  expect(result.error?.code).toBe('SESSION_CHANGED');
  expect(api.hasSession()).toBe(true);
  expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  expect(unauthorized).not.toHaveBeenCalled();
});

it('orders logout after an in-flight token save so the old write cannot restore a signed-out session',async()=>{
  const write=deferred<void>();
  (SecureStore.setItemAsync as jest.Mock).mockReturnValueOnce(write.promise);
  const saving=api.setToken('session');
  await Promise.resolve();
  const logout=api.clearToken();
  expect(api.hasSession()).toBe(false);
  expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  write.resolve();
  await Promise.all([saving,logout]);
  expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
  expect(api.hasSession()).toBe(false);
});
