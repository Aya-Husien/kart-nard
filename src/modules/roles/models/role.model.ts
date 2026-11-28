import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'roles', timestamps: false })
export class Role extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string | null;
}
