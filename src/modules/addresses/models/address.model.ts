import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from '../../users/models/user.model.js';

export interface AddressLocation {
  latitude: number;
  longitude: number;
}

@Table({ tableName: 'addresses', timestamps: false })
export class Address extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare address: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare city: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare location: AddressLocation;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string | null;
}
