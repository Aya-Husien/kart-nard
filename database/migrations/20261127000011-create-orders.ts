import { DataTypes, literal, type QueryInterface } from 'sequelize';

export async function up(context: QueryInterface) 
  {
    await context.sequelize.transaction(async (transaction) => {
      await context.createTable('orders', {
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
        address_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'addresses', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        address_snapshot: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
        user_coupon_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'user_coupons', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
          unique: true,
        },
        order_type: {
          type: DataTypes.ENUM('PURCHASE', 'RENTAL'),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'COMPLETED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        discount_amount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        total_amount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
      }, { transaction });
      await context.sequelize.query(`ALTER TABLE "orders" ADD CONSTRAINT "orders_amount_valid" CHECK (total_amount >= 0 AND discount_amount >= 0)`, { transaction });
      await context.sequelize.query(`ALTER TABLE "orders" ADD CONSTRAINT "orders_purchase_no_coupon" CHECK (order_type <> 'PURCHASE' OR (user_coupon_id IS NULL AND discount_amount = 0))`, { transaction });
      await context.addIndex('orders', ["user_id", "created_at"], { name: 'orders_history_idx', unique: false, transaction });
      await context.addIndex('orders', ["status"], { name: 'orders_status_idx', unique: false, transaction });
    });
  }

  export async function down({ context }: { context: QueryInterface }) {
    await context.sequelize.transaction(async (transaction) => {
      await context.dropTable('orders', { transaction });
      await context.sequelize.query('DROP TYPE IF EXISTS "enum_orders_order_type"', { transaction });
      await context.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status"', { transaction });
    });
  }
