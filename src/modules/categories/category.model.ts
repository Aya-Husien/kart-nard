import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'categories', timestamps: false })
export class Category extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(150), allowNull: false, unique: true })
  declare name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;
}
