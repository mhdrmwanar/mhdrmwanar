export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
}

export interface AuthRequest {
    username: string;
    password: string;
}

export interface PaymentData {
    cardNumber: string;
    cardHolderName: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    billingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    userId: string | number;
    userEmail: string;
    timestamp: number;
    ipAddress?: string;
    userAgent?: string;
}

export interface EncryptedPaymentData {
    encryptedData: string;
    keyHash: string;
    timestamp: number;
    userId: string | number;
}

export interface PaymentToken {
    userId: string | number;
    transactionId: string;
    timestamp: number;
    nonce: string;
}

// Extended Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: any;
            clientIp?: string;
        }
    }
}