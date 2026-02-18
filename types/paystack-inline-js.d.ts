declare module '@paystack/inline-js' {
  interface PaystackTransaction {
    reference: string;
    trans: string;
    status: string;
    message: string;
    transaction: string;
    trxref: string;
  }

  interface PaystackConfig {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    firstName?: string;
    lastName?: string;
    planInterval?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually';
    onSuccess?: (transaction: PaystackTransaction) => void;
    onLoad?: (response: any) => void;
    onCancel?: () => void;
    onError?: (error: Error) => void;
  }

  interface PaymentRequestConfig extends PaystackConfig {
    container: string;
    loadPaystackCheckoutButton?: string;
    styles?: {
      theme?: string;
      applePay?: {
        width?: string;
        height?: string;
        borderRadius?: string;
        type?: string;
        locale?: string;
      };
    };
    onElementsMount?: (elements: any) => void;
  }

  class Paystack {
    constructor();
    checkout(config: PaystackConfig): Promise<void>;
    newTransaction(config: PaystackConfig): void;
    preloadTransaction(config: PaystackConfig): () => void;
    paymentRequest(config: PaymentRequestConfig): Promise<void>;
  }

  export default Paystack;
}
