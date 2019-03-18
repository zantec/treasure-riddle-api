const axios = require('axios');
const app = require('./index.js');
const supertest = require('supertest');

test('health endpoint', (done) => {
  supertest(app).get('/health')
    .then((success) => {
      expect(success.text).toBe('UP!');
      done();
    })
    .catch((err) => {
      console.log(err);
      done();
    })
});

// test('treasure randomly generated', (done) => {
//   supertest(app).post('/api/server/treasure')
//     .then((success) => {
//       expect(success).toBeDefined();
//       done();
//     })
//     .catch((err) => {
//       console.log(err);
//       done();
//     })
// });

// test('riddle procedurally generated', (done) => {
//   supertest(app).post('/api/server/treasure');
// })
