import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./userModel";

export enum TransactionStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SUCCESS = 'success',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    BANK_TRANSFER = 'bank_transfer',
    E_WALLET = 'e_wallet'
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column()
    currency: string;

    @Column({
        type: 'varchar',
        enum: PaymentMethod,
        default: PaymentMethod.CREDIT_CARD
    })
    paymentMethod: PaymentMethod;

    @Column({
        type: 'varchar',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING
    })
    status: TransactionStatus;

    @Column({ type: 'text' })
    encryptedPaymentData: string; // Data kartu kredit, dll terenkripsi AES

    @Column({ nullable: true })
    transactionReference: string; // Reference dari payment gateway

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    merchantId: string;

    @Column({ type: 'text', nullable: true })
    encryptedResponseData: string; // Response dari payment gateway terenkripsi

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    processedAt: Date;

    @Column({ nullable: true })
    failureReason: string;

    // Method untuk validasi amount
    isValidAmount(): boolean {
        return this.amount > 0 && this.amount <= 999999.99;
    }

    // Method untuk cek apakah transaksi masih bisa diproses
    canBeProcessed(): boolean {
        return this.status === TransactionStatus.PENDING;
    }

    // Method untuk cek apakah transaksi sudah selesai
    isCompleted(): boolean {
        return [
            TransactionStatus.SUCCESS, 
            TransactionStatus.FAILED, 
            TransactionStatus.CANCELLED
        ].includes(this.status);
    }
}
