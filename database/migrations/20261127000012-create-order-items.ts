import { DataTypes, type QueryInterface } from 'sequelize';

export async function up({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.createTable('order_items', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'games', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unit_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      item_type: {
        type: DataTypes.ENUM('PURCHASE', 'RENTAL'),
        allowNull: false,
      },
      rental_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
    }, { transaction });
    await context.sequelize.query(`ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_valid" CHECK (quantity > 0)`, { transaction });
    await context.sequelize.query(`ALTER TABLE "order_items" ADD CONSTRAINT "order_items_prices_valid" CHECK (unit_price >= 0 AND subtotal >= 0)`, { transaction });
    await context.sequelize.query(`ALTER TABLE "order_items" ADD CONSTRAINT "order_items_rental_duration_valid" CHECK ((item_type = 'PURCHASE' AND rental_duration IS NULL) OR (item_type = 'RENTAL' AND rental_duration IS NOT NULL AND rental_duration > 0))`, { transaction });
    await context.addIndex('order_items', ["order_id", "game_id"], { name: 'order_items_order_game_uq', unique: true, transaction });
    await context.addIndex('order_items', ["game_id"], { name: 'order_items_game_idx', unique: false, transaction });
  });
}

export async function down({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.dropTable('order_items', { transaction });
    await context.sequelize.query('DROP TYPE IF EXISTS "enum_order_items_item_type"', { transaction });
    await context.sequelize.query('DROP TYPE IF EXISTS "enum_order_items_status"', { transaction });
  });
}
