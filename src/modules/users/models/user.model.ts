import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Role } from '../../roles/models/role.model.js';
import { UserStatus } from '../enums/user-status.enum.js';

@Table({ tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class User extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(254), allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare password: string;

  @Column({ type: DataType.STRING(32), allowNull: false })
  declare phone: string;

  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare role_id: number;

  @BelongsTo(() => Role)
  declare role: Role;

  @Column({
    type: DataType.ENUM(...Object.values(UserStatus)),
    allowNull: false,
    defaultValue: UserStatus.ACTIVE,
  })
  declare status: UserStatus;

  @Column({ type: DataType.DATE, allowNull: true })
  declare email_verified_at: Date | null;
}
