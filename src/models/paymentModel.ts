import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./userModel";

export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    BANK_TRANSFER = 'bank_transfer',
    DIGITAL_WALLET = 'digital_wallet',
    CRYPTOCURRENCY = 'cryptocurrency'
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: number;

    @ManyToOne(() => User, { nullable: false })
    user: User;

    @Column('decimal', { precision: 15, scale: 2 })
    amount: number;

    @Column()
    currency: string;

    @Column({
        type: 'varchar',
        length: 20,
        default: PaymentMethod.CREDIT_CARD
    })
    paymentMethod: PaymentMethod;

    @Column({
        type: 'varchar',
        length: 20,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    @Column('text')
    encryptedPaymentData: string;

    @Column()
    keyHash: string;

    @Column()
    merchantId: string;

    @Column({ nullable: true })
    merchantOrderId: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    paymentToken: string;

    @Column({ type: 'bigint' })
    tokenTimestamp: number;

    @Column({ nullable: true })
    externalTransactionId: string;

    @Column({ nullable: true })
    processorResponse: string;

    @Column({ nullable: true })
    failureReason: string;

    @OneToMany(() => require('./transactionModel').Transaction, (transaction: any) => transaction.payment)
    transactions: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ nullable: true })
    expiredAt: Date;

    // Computed fields
    get isExpired(): boolean {
        return this.expiredAt ? new Date() > this.expiredAt : false;
    }

    get isActive(): boolean {
        return [PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(this.status) && !this.isExpired;
    }
}
