const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');
function loader(mocks = {}, environment = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(root, file);
    if (!fs.existsSync(file)) file += '.js';
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.js');
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} }; cache.set(file, module);
    const code = babel.transformSync(fs.readFileSync(file, 'utf8'), { filename: file, configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-modules-commonjs', '@babel/plugin-transform-react-jsx'] }).code;
    const localRequire = id => Object.hasOwn(mocks, id) ? mocks[id] : id.startsWith('.') ? load(path.resolve(path.dirname(file), id)) : require(id);
    vm.runInNewContext(code, { require: localRequire, module, exports: module.exports, console, process: { env: environment }, setTimeout, clearTimeout });
    return module.exports;
  }
  return load;
}
test('normalizes API and separate socket URLs', () => {
  const config = loader({}, { EXPO_PUBLIC_API_URL: 'https://api.example.test///', EXPO_PUBLIC_SOCKET_URL: 'https://chat.example.test' })('AppConfig.js').default;
  assert.equal(config.ApiUrl, 'https://api.example.test/');
  assert.equal(config.SocketBaseUrl, 'https://chat.example.test/');
});
test('sign-out clears account data and Redux without removing device preferences', async () => {
  const removed = [], actions = [];
  const React = { createContext: () => ({ Provider: 'provider' }), useState: value => [value, () => {}], useEffect: () => {}, useContext: () => null, createElement: (type, props) => ({ type, props }) };
  const load = loader({ react: React, '@react-native-async-storage/async-storage': { multiRemove: async keys => removed.push(...keys) }, '../Services/authService': {}, '@react-navigation/native': {}, '../Services/LocationContextService': {}, axios: {}, 'react-native-toast-message': {}, '../Services/httpservice': {}, '../features': { store: { dispatch: action => actions.push(action.type) } } });
  await load('Context/AuthContext.js').AuthProvider({ children: null }).props.value.signOut();
  assert.deepEqual(removed.sort(), ['authToken', 'newLocation', 'userData', 'user_info']);
  assert.deepEqual(actions, ['session/reset']);
});
test('Redux reset discards account data in every feature slice', () => {
  const { store } = loader({ axios: { create: () => ({}) } })('features/index.js');
  const initial = JSON.stringify(store.getState());
  store.dispatch({ type: 'SignUp/handleSignUp/fulfilled', payload: { user: { _id: 'private-user' } } });
  assert.notEqual(JSON.stringify(store.getState()), initial);
  store.dispatch({ type: 'session/reset' });
  assert.equal(JSON.stringify(store.getState()), initial);
});
test('geocoding rejects an API denial instead of reporting success', async () => {
  const { configureStore } = require('@reduxjs/toolkit');
  const { default: reducer, getIAmHear } = loader({ axios: { get: async () => ({ data: { status: 'REQUEST_DENIED', error_message: 'Invalid key' } }) } })('features/hangout/hangoutSlice.js');
  const store = configureStore({ reducer });
  await assert.rejects(store.dispatch(getIAmHear({ latitude: 1, longitude: 1 })).unwrap());
  assert.equal(store.getState().loading, false);
});
test('production compilation removes sensitive console payloads', () => {
  const output = babel.transformSync('console.log({ password: "secret" }); doWork();', { configFile: false, babelrc: false, plugins: ['transform-remove-console'] }).code;
  assert.equal(output.includes('secret'), false);
  assert.equal(output.includes('doWork'), true);
});
test('analyzer ignores commented routes and detects undefined OTP setters', async () => {
  const { analyzeFile } = await import('./audit-app.mjs');
  const result = analyzeFile('navigation/Test.jsx', 'const Stack = {}; const Screen = () => null; const ui = <><Stack.Screen name="Live" component={Screen} />{/* <Stack.Screen name="Dead" /> */}</>; setMissingOtp(true);');
  assert.deepEqual(result.routes.map(r => r.name), ['Live']);
  assert.deepEqual(result.errors.map(e => e.message), ['setMissingOtp']);
});
