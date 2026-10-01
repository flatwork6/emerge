# Load Testing Proof of Concept (POC)

## 1. Objective
The goal of this Proof of Concept is to establish a methodology and tooling for load testing the backend APIs that power the `emerge-mobile` automation suite. Load testing will help identify performance bottlenecks, ensure system stability under heavy concurrent traffic, and validate API response times.

## 2. Tooling & Technologies
For a JavaScript/Node.js based ecosystem (which you are using for WebdriverIO), the two industry-standard tools are **k6** and **Artillery**. 

### Recommendation: k6 (by Grafana Labs)
- **Language**: Tests are written in JavaScript (ES6).
- **Performance**: Built in Go, meaning it can generate massive load using very few system resources (unlike Node or Java-based tools).
- **Use Case**: Best for API load testing, spike testing, and stress testing.
- **Reporting**: Native integration with Grafana, Datadog, InfluxDB, etc.

*Alternative Note:* If strict admin constraints prevent installing the `k6` binary system-wide, **Artillery** (`npm install -g artillery`) is a pure Node.js alternative that requires no admin rights, though it is slightly less performant at massive scales.

---

## 3. How the k6 POC Script Works

The provided POC script (`load-tests/poc.js`) acts as a blueprint for a load test. 

### A. Stages (Traffic Shaping)
```javascript
export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 users
    { duration: '30s', target: 20 }, // Hold load 
    { duration: '10s', target: 0 },  // Ramp down gracefully
  ],
};
```
This tells the tool exactly how to simulate traffic. It gradually increases the number of Virtual Users (VUs) to prevent suddenly overwhelming the server and triggering DDoS protection.

### B. Thresholds (Pass/Fail Criteria)
```javascript
thresholds: {
  http_req_duration: ['p(95)<500'], // 95% of requests must complete under 500ms
  http_req_failed: ['rate<0.01'],   // The error rate must be below 1%
}
```
Thresholds allow the test to automatically "Fail" in a CI/CD pipeline if the performance degrades below your Service Level Agreements (SLAs).

### C. The User Journey (Iteration)
```javascript
export default function () {
  const res = http.get('https://api.example.com/data');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1); // Think time
}
```
Each Virtual User executes this default function in a loop. The `check` acts like an assertion, and `sleep` simulates a real user pausing to look at the screen before the next action.

---

## 4. Next Steps for Implementation

If the team decides to move forward with this approach, the following phases are recommended:

1. **API Mapping**: Identify the critical user journeys (e.g., Login -> View Portfolio -> Place Order) and map them to the specific backend HTTP endpoints.
2. **Data Parameterization**: Modify the script to read from a CSV file (e.g., `test/data/testData.csv`) so that each Virtual User logs in with a different set of credentials. 
3. **Environment Variables**: Update the script to use `__ENV.BASE_URL` so you can target `staging` or `prod` dynamically without changing code.
4. **CI/CD Integration**: Add a step in your Jenkins/GitLab/GitHub Actions pipeline to run the load test automatically on a schedule (e.g., nightly) or prior to a major release.
