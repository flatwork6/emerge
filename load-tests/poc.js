import http from 'k6/http';
import { check, sleep } from 'k6';

// This is the configuration for our load test POC
export const options = {
  // Define stages of the test
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 virtual users over 10 seconds
    { duration: '30s', target: 20 }, // Stay at 20 virtual users for 30 seconds
    { duration: '10s', target: 0 },  // Ramp down to 0 virtual users over 10 seconds
  ],
  // Define thresholds (pass/fail criteria)
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

// The default function represents a single Virtual User (VU) iteration
export default function () {
  // Replace this URL with your actual backend API endpoint used by the mobile app
  const url = 'https://test-api.k6.io/public/crocodiles/'; 

  // Make a GET request
  const res = http.get(url);

  // Assertions (Checks)
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time is acceptable': (r) => r.timings.duration < 500,
  });

  // Pause for 1 second between iterations to simulate real user think time
  sleep(1);
}
