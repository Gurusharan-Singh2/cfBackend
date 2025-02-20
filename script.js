import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
  cloud: {
    // Project: Testing
    projectID: 3748349,
    // Test runs with the same name groups test runs together.
    name: 'Test (18/02/2025-13:53:35)'
  },
  // thresholds:{
  //   http_req_failed:['rate<0.01'], // http errors should be less than 1%
  //   http_req_duration:['p(95)<200'] // 95% of request shoulld be below 200ms
  // }
};

export default function() {
  http.get('http://localhost:8080/api/get-all-books');
  sleep(1);
}