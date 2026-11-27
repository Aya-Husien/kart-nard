import { DataTypes, type QueryInterface } from 'sequelize';

export async function up({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.createTable('favorites', {
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
        onDelete: 'CASCADE',
      },
      game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'games', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    }, { transaction });
    await context.addIndex('favorites', ["user_id", "game_id"], { name: 'favorites_user_game_uq', unique: true, transaction });
    await context.addIndex('favorites', ["game_id"], { name: 'favorites_game_idx', unique: false, transaction });
  });
}

export async function down({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.dropTable('favorites', { transaction });
  });
}
