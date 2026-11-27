import { DataTypes, type QueryInterface } from 'sequelize';

export async function up({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.createTable('coupons', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      discount_type: {
        type: DataTypes.ENUM('PERCENTAGE', 'FIXED'),
        allowNull: false,
      },
      discount_value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      min_order_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      applicable_to: {
        type: DataTypes.ENUM('PURCHASE', 'RENTAL'),
        allowNull: false,
        defaultValue: 'RENTAL',
      },
      usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      valid_from: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      valid_until: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
    }, { transaction });
    await context.sequelize.query(`ALTER TABLE "coupons" ADD CONSTRAINT "coupons_values_valid" CHECK (discount_value > 0 AND min_order_amount >= 0 AND usage_limit > 0 AND (discount_type <> 'PERCENTAGE' OR discount_value <= 100))`, { transaction });
    await context.sequelize.query(`ALTER TABLE "coupons" ADD CONSTRAINT "coupons_dates_valid" CHECK (valid_until > valid_from)`, { transaction });
  });
}

export async function down({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.dropTable('coupons', { transaction });
    await context.sequelize.query('DROP TYPE IF EXISTS "enum_coupons_discount_type"', { transaction });
    await context.sequelize.query('DROP TYPE IF EXISTS "enum_coupons_applicable_to"', { transaction });
    await context.sequelize.query('DROP TYPE IF EXISTS "enum_coupons_status"', { transaction });
  });
}
