import * as CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

/**
 * Service untuk implementasi keamanan end-to-end dengan algoritma AES
 * dan kunci pribadi berdasarkan identifier unik pengguna
 */
class EncryptionService {
    private masterKey: string;
    
    constructor() {
        this.masterKey = process.env.MASTER_ENCRYPTION_KEY || 'default_master_key_change_in_production';
    }

    /**
     * Generate kunci pribadi unik berdasarkan identifier pengguna
     * @param userId - ID unik pengguna
     * @param userEmail - Email pengguna sebagai salt tambahan
     * @returns Private key yang unik untuk pengguna
     */
    generateUserPrivateKey(userId: string | number, userEmail: string): string {
        const userIdentifier = `${userId}_${userEmail}`;
        const privateKey = CryptoJS.PBKDF2(
            userIdentifier, 
            this.masterKey, 
            { 
                keySize: 256/32, 
                iterations: 10000 
            }
        ).toString();
        
        return privateKey;
    }

    /**
     * Enkripsi data menggunakan AES dengan kunci pribadi pengguna
     * @param data - Data yang akan dienkripsi
     * @param userPrivateKey - Kunci pribadi pengguna
     * @returns Data terenkripsi
     */
    encryptData(data: string, userPrivateKey: string): string {
        try {
            const encrypted = CryptoJS.AES.encrypt(data, userPrivateKey).toString();
            return encrypted;
        } catch (error) {
            throw new Error('Encryption failed');
        }
    }

    /**
     * Dekripsi data menggunakan AES dengan kunci pribadi pengguna
     * @param encryptedData - Data terenkripsi
     * @param userPrivateKey - Kunci pribadi pengguna
     * @returns Data asli
     */
    decryptData(encryptedData: string, userPrivateKey: string): string {
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedData, userPrivateKey);
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            throw new Error('Decryption failed');
        }
    }

    /**
     * Enkripsi data payment dengan multiple layer security
     * @param paymentData - Data pembayaran
     * @param userId - ID pengguna
     * @param userEmail - Email pengguna
     * @returns Encrypted payment data dengan metadata
     */
    encryptPaymentData(paymentData: any, userId: string | number, userEmail: string): {
        encryptedData: string;
        keyHash: string;
        timestamp: number;
        userId: string | number;
    } {
        const privateKey = this.generateUserPrivateKey(userId, userEmail);
        const serializedData = JSON.stringify(paymentData);
        const encryptedData = this.encryptData(serializedData, privateKey);
        
        // Create key hash for verification (tidak menyimpan kunci asli)
        const keyHash = CryptoJS.SHA256(privateKey).toString();
        
        return {
            encryptedData,
            keyHash,
            timestamp: Date.now(),
            userId
        };
    }

    /**
     * Dekripsi data payment dengan verifikasi integritas
     * @param encryptedPayment - Data pembayaran terenkripsi
     * @param userId - ID pengguna
     * @param userEmail - Email pengguna
     * @returns Decrypted payment data
     */
    decryptPaymentData(encryptedPayment: {
        encryptedData: string;
        keyHash: string;
        timestamp: number;
        userId: string | number;
    }, userId: string | number, userEmail: string): any {
        // Verifikasi user ID
        if (encryptedPayment.userId !== userId) {
            throw new Error('Unauthorized access to payment data');
        }
        
        const privateKey = this.generateUserPrivateKey(userId, userEmail);
        const keyHash = CryptoJS.SHA256(privateKey).toString();
        
        // Verifikasi integritas kunci
        if (keyHash !== encryptedPayment.keyHash) {
            throw new Error('Key integrity verification failed');
        }
        
        const decryptedData = this.decryptData(encryptedPayment.encryptedData, privateKey);
        
        if (!decryptedData) {
            throw new Error('Failed to decrypt payment data');
        }
        
        return JSON.parse(decryptedData);
    }

    /**
     * Generate secure transaction ID
     * @returns Unique transaction ID
     */
    generateTransactionId(): string {
        return uuidv4();
    }

    /**
     * Generate secure payment token untuk session
     * @param userId - ID pengguna
     * @param transactionId - ID transaksi
     * @returns Secure payment token
     */
    generatePaymentToken(userId: string | number, transactionId: string): string {
        const payload = {
            userId,
            transactionId,
            timestamp: Date.now(),
            nonce: crypto.randomBytes(16).toString('hex')
        };
        
        const token = CryptoJS.AES.encrypt(
            JSON.stringify(payload), 
            this.masterKey
        ).toString();
        
        return token;
    }

    /**
     * Verify payment token
     * @param token - Payment token
     * @returns Verified payload
     */
    verifyPaymentToken(token: string): any {
        try {
            const decrypted = CryptoJS.AES.decrypt(token, this.masterKey);
            const payload = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            
            // Check token expiry (15 minutes)
            const now = Date.now();
            const tokenAge = now - payload.timestamp;
            if (tokenAge > 15 * 60 * 1000) {
                throw new Error('Payment token expired');
            }
            
            return payload;
        } catch (error) {
            throw new Error('Invalid payment token');
        }
    }

    /**
     * Hash sensitive data untuk logging (one-way)
     * @param data - Data yang akan di-hash
     * @returns Hashed data
     */
    hashSensitiveData(data: string): string {
        return CryptoJS.SHA256(data).toString();
    }
}

export default EncryptionService;
