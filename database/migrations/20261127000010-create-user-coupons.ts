import { DataTypes, literal, type QueryInterface } from 'sequelize';

export async function up({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.createTable('user_coupons', {
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
      coupon_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'coupons', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal('CURRENT_TIMESTAMP'),
      },
    }, { transaction });
    await context.sequelize.query(`ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_usage_valid" CHECK (is_used = (used_at IS NOT NULL))`, { transaction });
    await context.addIndex('user_coupons', ["user_id", "coupon_id"], { name: 'user_coupons_lookup_idx', unique: false, transaction });
    await context.addIndex('user_coupons', ["coupon_id", "is_used"], { name: 'user_coupons_usage_idx', unique: false, transaction });
  });
}

export async function down({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.dropTable('user_coupons', { transaction });
  });
}
