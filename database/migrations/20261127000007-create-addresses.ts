import { DataTypes, type QueryInterface } from 'sequelize';

export async function up({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.createTable('addresses', {
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
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      location: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    }, { transaction });
    await context.sequelize.query(`ALTER TABLE "addresses" ADD CONSTRAINT "addresses_location_valid" CHECK (jsonb_typeof(location) = 'object' AND location ? 'latitude' AND location ? 'longitude' AND CASE WHEN jsonb_typeof(location->'latitude') = 'number' AND jsonb_typeof(location->'longitude') = 'number' THEN (location->>'latitude')::numeric BETWEEN -90 AND 90 AND (location->>'longitude')::numeric BETWEEN -180 AND 180 ELSE false END)`, { transaction });
    await context.addIndex('addresses', ["user_id"], { name: 'addresses_user_idx', unique: false, transaction });
  });
}

export async function down({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.dropTable('addresses', { transaction });
  });
}
