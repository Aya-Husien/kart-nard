import { DataTypes, literal, type QueryInterface } from 'sequelize';

export async function up(context: QueryInterface) 
  {
    await context.sequelize.transaction(async (transaction) => {
      await context.createTable('games', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        category_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'categories', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        purchase_price: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
        },
        rental_price_per_day: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
        },
        stock_quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        rented_quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },
        age_group: {
          type: DataTypes.ENUM('CHILD', 'YOUNG'),
          allowNull: false,
        },
        level_game: {
          type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
          allowNull: false,
        },
        min_players: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        max_players: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        play_duration_minutes: {
          type: DataTypes.INTEGER,
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
      await context.sequelize.query(`ALTER TABLE "games" ADD CONSTRAINT "games_prices_valid" CHECK (purchase_price >= 0 AND rental_price_per_day >= 0)`, { transaction });
      await context.sequelize.query(`ALTER TABLE "games" ADD CONSTRAINT "games_stock_valid" CHECK (stock_quantity >= 0 AND rented_quantity >= 0 AND rented_quantity <= stock_quantity)`, { transaction });
      await context.sequelize.query(`ALTER TABLE "games" ADD CONSTRAINT "games_players_valid" CHECK (min_players > 0 AND max_players >= min_players)`, { transaction });
      await context.sequelize.query(`ALTER TABLE "games" ADD CONSTRAINT "games_duration_valid" CHECK (play_duration_minutes > 0)`, { transaction });
      await context.addIndex('games', ["category_id"], { name: 'games_category_idx', unique: false, transaction });
    });
  }

  export async function down({ context }: { context: QueryInterface }) {
    await context.sequelize.transaction(async (transaction) => {
      await context.dropTable('games', { transaction });
      await context.sequelize.query('DROP TYPE IF EXISTS "enum_games_status"', { transaction });
      await context.sequelize.query('DROP TYPE IF EXISTS "enum_games_age_group"', { transaction });
      await context.sequelize.query('DROP TYPE IF EXISTS "enum_games_level_game"', { transaction });
    });
  }
