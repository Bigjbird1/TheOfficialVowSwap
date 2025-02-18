import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    // Test checkout flow under load
    checkout_flow: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 20 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    // Test WebSocket real-time features
    realtime_messaging: {
      executor: 'constant-vus',
      vus: 50,
      duration: '3m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
    errors: ['rate<0.05'],            // Less than 5% error rate
  },
};

const BASE_URL = 'http://localhost:3000';

// Simulate checkout flow
export function checkoutFlow() {
  const payload = {
    items: [
      { id: 'test-product-1', quantity: 1 },
      { id: 'test-product-2', quantity: 2 },
    ],
    shippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345',
    },
    paymentMethod: 'test-payment-method',
  };

  const responses = {
    cart: http.post(`${BASE_URL}/api/cart/add`, JSON.stringify(payload.items), {
      headers: { 'Content-Type': 'application/json' },
    }),
    checkout: http.post(`${BASE_URL}/api/checkout/process`, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
    }),
  };

  check(responses.cart, {
    'cart add successful': (r) => r.status === 200,
  }) || errorRate.add(1);

  check(responses.checkout, {
    'checkout successful': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);
}

// Simulate real-time messaging
export function realtimeMessaging() {
  const conversationId = 'test-conversation-1';
  const messages = [
    'Hello, I have a question about the product',
    'Is this item still available?',
    'What are the shipping options?',
  ];

  messages.forEach(message => {
    const response = http.post(`${BASE_URL}/api/seller/messages`, JSON.stringify({
      conversationId,
      message,
      timestamp: new Date().toISOString(),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(response, {
      'message sent successfully': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  // Simulate WebSocket connection polling
  http.get(`${BASE_URL}/api/seller/messages?conversationId=${conversationId}`);
  
  sleep(0.5);
}

export default function() {
  const scenario = __ENV.SCENARIO || 'both';
  
  if (scenario === 'checkout' || scenario === 'both') {
    checkoutFlow();
  }
  
  if (scenario === 'realtime' || scenario === 'both') {
    realtimeMessaging();
  }
}
