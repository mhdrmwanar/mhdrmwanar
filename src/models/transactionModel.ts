import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./userModel";

export enum TransactionType {
    CHARGE = 'charge',
    REFUND = 'refund',
    PARTIAL_REFUND = 'partial_refund',
    CHARGEBACK = 'chargeback',
    AUTHORIZATION = 'authorization',
    CAPTURE = 'capture',
    VOID = 'void'
}

export enum TransactionStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired'
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: number;

    @ManyToOne(() => User, { nullable: false })
    user: User;

    @Column({ nullable: true })
    paymentId: string;

    @ManyToOne(() => require('./paymentModel').Payment, (payment: any) => payment.transactions, { nullable: true })
    payment: any;

    @Column({
        type: 'varchar',
        length: 20,
        default: TransactionType.CHARGE
    })
    type: TransactionType;

    @Column({
        type: 'varchar',
        length: 20,
        default: TransactionStatus.PENDING
    })
    status: TransactionStatus;

    @Column('decimal', { precision: 15, scale: 2 })
    amount: number;

    @Column()
    currency: string;

    @Column('text')
    encryptedTransactionData: string;

    @Column()
    keyHash: string;

    @Column({ nullable: true })
    externalTransactionId: string;

    @Column({ nullable: true })
    processorName: string;

    @Column({ nullable: true })
    processorResponse: string;

    @Column({ nullable: true })
    authorizationCode: string;

    @Column({ nullable: true })
    merchantReference: string;

    @Column({ nullable: true })
    customerReference: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    deviceFingerprint: string;

    @Column({ nullable: true })
    riskScore: number;

    @Column({ nullable: true })
    fraudFlags: string;

    @Column({ nullable: true })
    failureReason: string;

    @Column({ nullable: true })
    gatewayResponse: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    processedAt: Date;

    @Column({ nullable: true })
    expiredAt: Date;

    // Computed fields
    get isExpired(): boolean {
        return this.expiredAt ? new Date() > this.expiredAt : false;
    }

    get isSuccessful(): boolean {
        return this.status === TransactionStatus.COMPLETED;
    }

    get isFailed(): boolean {
        return [TransactionStatus.FAILED, TransactionStatus.CANCELLED, TransactionStatus.EXPIRED].includes(this.status);
    }

    get isPending(): boolean {
        return [TransactionStatus.PENDING, TransactionStatus.PROCESSING].includes(this.status);
    }
}
