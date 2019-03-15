const axios = require('axios');

test('health endpoint', (done) => {
  return axios({
    method: 'POST',
    url: '/api/server/treasure',
  })
    .then((success) => {
      expect(success).toBe('UP!');
      done();
    })
});
