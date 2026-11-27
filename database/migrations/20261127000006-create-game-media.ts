import { DataTypes, literal, type QueryInterface } from 'sequelize';

export async function up({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.createTable('game_media', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'games', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      media_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      media_type: {
        type: DataTypes.ENUM('IMAGE', 'VIDEO'),
        allowNull: false,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal('CURRENT_TIMESTAMP'),
      },
    }, { transaction });
    await context.sequelize.query(`ALTER TABLE "game_media" ADD CONSTRAINT "game_media_primary_image_only" CHECK (NOT is_primary OR media_type = 'IMAGE')`, { transaction });
    await context.addIndex('game_media', ["game_id"], { name: 'game_media_game_idx', unique: false, transaction });
    await context.sequelize.query(
      'CREATE UNIQUE INDEX game_media_one_primary_idx ON game_media (game_id) WHERE is_primary',
      { transaction },
    );
  });
}

export async function down({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.dropTable('game_media', { transaction });
    await context.sequelize.query('DROP TYPE IF EXISTS "enum_game_media_media_type"', { transaction });
  });
}
