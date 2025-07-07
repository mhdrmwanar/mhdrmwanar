import * as CryptoJS from 'crypto-js';

/**
 * AES Encryption Service
 * Implementasi keamanan end-to-end dengan algoritma AES
 * Kunci pribadi berdasarkan identifier unik pengguna
 */
class AESService {
    private static readonly ALGORITHM = 'AES';
    private static readonly KEY_SIZE = 256;
    private static readonly IV_SIZE = 16;

    /**
     * Generate kunci AES berdasarkan identifier unik pengguna
     * @param userId - Identifier unik pengguna
     * @param secretSalt - Salt tambahan untuk keamanan
     * @returns Private key untuk user
     */
    static generateUserPrivateKey(userId: number, secretSalt: string = 'jwt-payment-gateway'): string {
        // Kombinasi userId, timestamp, dan salt untuk generate kunci unik
        const keyMaterial = `${userId}-${secretSalt}-${process.env.JWT_SECRET}`;
        
        // Hash dengan SHA-256 untuk menghasilkan kunci 256-bit
        const privateKey = CryptoJS.SHA256(keyMaterial).toString(CryptoJS.enc.Hex);
        
        return privateKey;
    }

    /**
     * Enkripsi data dengan AES-256-CBC
     * @param data - Data yang akan dienkripsi
     * @param userId - ID pengguna untuk generate kunci
     * @returns Data terenkripsi dalam format base64
     */
    static encrypt(data: string, userId: number): string {
        try {
            // Generate kunci pribadi user
            const privateKey = this.generateUserPrivateKey(userId);
            
            // Convert key ke WordArray
            const key = CryptoJS.enc.Hex.parse(privateKey);
            
            // Generate IV random
            const iv = CryptoJS.lib.WordArray.random(this.IV_SIZE);
            
            // Enkripsi dengan AES-256-CBC
            const encrypted = CryptoJS.AES.encrypt(data, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            // Gabungkan IV dan ciphertext
            const result = iv.concat(encrypted.ciphertext);
            
            return result.toString(CryptoJS.enc.Base64);
        } catch (error) {
            throw new Error(`Encryption failed: ${error}`);
        }
    }

    /**
     * Dekripsi data dengan AES-256-CBC
     * @param encryptedData - Data terenkripsi dalam format base64
     * @param userId - ID pengguna untuk generate kunci
     * @returns Data asli yang sudah didekripsi
     */
    static decrypt(encryptedData: string, userId: number): string {
        try {
            // Generate kunci pribadi user
            const privateKey = this.generateUserPrivateKey(userId);
            
            // Convert key ke WordArray
            const key = CryptoJS.enc.Hex.parse(privateKey);
            
            // Parse encrypted data
            const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedData);
            
            // Extract IV (16 bytes pertama)
            const iv = CryptoJS.lib.WordArray.create(encryptedBytes.words.slice(0, 4));
            
            // Extract ciphertext (sisanya)
            const ciphertext = CryptoJS.lib.WordArray.create(
                encryptedBytes.words.slice(4), 
                encryptedBytes.sigBytes - this.IV_SIZE
            );
            
            // Dekripsi dengan AES-256-CBC
            const decrypted = CryptoJS.AES.decrypt(
                CryptoJS.lib.CipherParams.create({ ciphertext: ciphertext }),
                key,
                {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            );
            
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            throw new Error(`Decryption failed: ${error}`);
        }
    }

    /**
     * Enkripsi data payment yang sensitif
     * @param paymentData - Data payment (card number, CVV, etc.)
     * @param userId - ID pengguna
     * @returns Encrypted payment data
     */
    static encryptPaymentData(paymentData: any, userId: number): string {
        const jsonData = JSON.stringify(paymentData);
        return this.encrypt(jsonData, userId);
    }

    /**
     * Dekripsi data payment
     * @param encryptedPaymentData - Data payment terenkripsi
     * @param userId - ID pengguna
     * @returns Decrypted payment data
     */
    static decryptPaymentData(encryptedPaymentData: string, userId: number): any {
        const decryptedJson = this.decrypt(encryptedPaymentData, userId);
        return JSON.parse(decryptedJson);
    }

    /**
     * Validasi kunci pribadi pengguna
     * @param userId - ID pengguna
     * @returns Information tentang kunci
     */
    static validateUserKey(userId: number): { isValid: boolean, keyInfo: any } {
        try {
            const privateKey = this.generateUserPrivateKey(userId);
            return {
                isValid: true,
                keyInfo: {
                    algorithm: this.ALGORITHM,
                    keySize: this.KEY_SIZE,
                    userId: userId,
                    keyLength: privateKey.length,
                    keyPreview: privateKey.substring(0, 8) + '...' + privateKey.substring(-8)
                }
            };
        } catch (error) {
            return {
                isValid: false,
                keyInfo: { error: error }
            };
        }
    }
}

export default AESService;
