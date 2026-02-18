const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface Plan {
  id: number;
  name: string;
  plan_code: string;
  amount: number;
  interval: string;
  currency: string;
}

interface Transaction {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface TransactionVerification {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    customer_code: string;
  };
  authorization: {
    authorization_code: string;
    card_type: string;
    last4: string;
    exp_month: string;
    exp_year: string;
  };
}

interface Subscription {
  customer: number;
  plan: number;
  subscription_code: string;
  email_token: string;
  status: string;
  amount: number;
  next_payment_date: string;
}

async function paystackRequest<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<PaystackResponse<T>> {
  const url = `${PAYSTACK_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'PayStack API request failed');
  }

  return data;
}

export async function createPlan(
  name: string,
  amount: number,
  interval: 'monthly' | 'annually' = 'monthly',
  currency: string = 'ZAR'
): Promise<Plan> {
  const response = await paystackRequest<Plan>('/plan', 'POST', {
    name,
    amount,
    interval,
    currency,
  });

  return response.data;
}

export async function listPlans(): Promise<Plan[]> {
  const response = await paystackRequest<Plan[]>('/plan');
  return response.data;
}

export async function initializeTransaction(
  email: string,
  amount: number,
  planCode?: string,
  callbackUrl?: string,
  metadata?: Record<string, any>
): Promise<Transaction> {
  const body: any = {
    email,
    amount,
    currency: 'ZAR',
  };

  if (planCode) {
    body.plan = planCode;
  }

  if (callbackUrl) {
    body.callback_url = callbackUrl;
  }

  if (metadata) {
    body.metadata = metadata;
  }

  const response = await paystackRequest<Transaction>(
    '/transaction/initialize',
    'POST',
    body
  );

  return response.data;
}

export async function verifyTransaction(
  reference: string
): Promise<TransactionVerification> {
  const response = await paystackRequest<TransactionVerification>(
    `/transaction/verify/${reference}`
  );

  return response.data;
}

export async function createSubscription(
  customer: string,
  planCode: string,
  authorizationCode?: string,
  startDate?: string
): Promise<Subscription> {
  const body: any = {
    customer,
    plan: planCode,
  };

  if (authorizationCode) {
    body.authorization = authorizationCode;
  }

  if (startDate) {
    body.start_date = startDate;
  }

  const response = await paystackRequest<Subscription>(
    '/subscription',
    'POST',
    body
  );

  return response.data;
}

export async function fetchSubscription(
  idOrCode: string
): Promise<Subscription> {
  const response = await paystackRequest<Subscription>(
    `/subscription/${idOrCode}`
  );

  return response.data;
}

export async function disableSubscription(
  code: string,
  token: string
): Promise<{ message: string }> {
  const response = await paystackRequest<{ message: string }>(
    '/subscription/disable',
    'POST',
    { code, token }
  );

  return response.data;
}

export async function enableSubscription(
  code: string,
  token: string
): Promise<{ message: string }> {
  const response = await paystackRequest<{ message: string }>(
    '/subscription/enable',
    'POST',
    { code, token }
  );

  return response.data;
}

export function validateWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

export const PLAN_LIMITS = {
  free: {
    invoices: 5,
    clients: 3,
    emails: 5,
  },
  pro: {
    invoices: Infinity,
    clients: Infinity,
    emails: Infinity,
  },
};

export const PLAN_PRICES = {
  free: 0,
  pro: 1000,
};

export const PRO_PLAN_NAME = 'Pro Plan - Monthly';
export const PRO_PLAN_AMOUNT = 1000;
export const PRO_PLAN_CURRENCY = 'ZAR';
