import { DataTypes, literal, type QueryInterface } from 'sequelize';

export async function up({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.createTable('reviews', {
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
      game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'games', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal('CURRENT_TIMESTAMP'),
      },
    }, { transaction });
    await context.sequelize.query(`ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_valid" CHECK (rating BETWEEN 1 AND 5)`, { transaction });
    await context.addIndex('reviews', ["user_id", "game_id"], { name: 'reviews_user_game_uq', unique: true, transaction });
    await context.addIndex('reviews', ["game_id"], { name: 'reviews_game_idx', unique: false, transaction });
  });
}

export async function down({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.dropTable('reviews', { transaction });
  });
}
