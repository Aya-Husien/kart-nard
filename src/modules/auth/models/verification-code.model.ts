import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from '../../users/models/user.model.js';

@Table({ tableName: 'verification_codes', timestamps: true, createdAt: 'created_at', updatedAt: false })
export class VerificationCode extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare code_hash: string;

  @Column({ type: DataType.ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET'), allowNull: false })
  declare type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

  @Column({ type: DataType.DATE, allowNull: false })
  declare expires_at: Date;

  @Column(DataType.DATE)
  declare used_at: Date | null;

  @Column(DataType.DATE)
  declare invalidated_at: Date | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare attempts: number;

  declare created_at: Date;
}
