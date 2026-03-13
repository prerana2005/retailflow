import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:80';

export default function () {
  const products = http.get(`${BASE_URL}/products`);
  check(products, {
    'products status 200': (r) => r.status === 200,
  });

  sleep(1);

  const order = http.post(
    `${BASE_URL}/orders`,
    JSON.stringify({
      user_id: 'loadtest-user',
      items: [{ product_id: '1', quantity: 1, price: 99.99 }],
      total_price: 99.99,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(order, {
    'order created': (r) => r.status === 201,
  });

  sleep(1);
}
