import { DataTypes, literal, type QueryInterface } from 'sequelize';

export async function up(context: QueryInterface) 
  {
    await context.sequelize.transaction(async (transaction) => {
      await context.createTable('complaints', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        order_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'orders', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
      }, { transaction });
      await context.addIndex('complaints', ["user_id"], { name: 'complaints_user_idx', unique: false, transaction });
      await context.addIndex('complaints', ["order_id"], { name: 'complaints_order_idx', unique: false, transaction });
    });
  }

  export async function down({ context }: { context: QueryInterface }) {
    await context.sequelize.transaction(async (transaction) => {
      await context.dropTable('complaints', { transaction });
      await context.sequelize.query('DROP TYPE IF EXISTS "enum_complaints_status"', { transaction });
    });
  }
