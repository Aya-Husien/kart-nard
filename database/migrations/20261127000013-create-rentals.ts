import { DataTypes, literal, type QueryInterface } from 'sequelize';

export async function up(context: QueryInterface) 
  {
    await context.sequelize.transaction(async (transaction) => {
      await context.createTable('rentals', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        order_item_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'order_items', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
          unique: true,
        },
        start_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        due_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        actual_return_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
      }, { transaction });
      await context.sequelize.query(`ALTER TABLE "rentals" ADD CONSTRAINT "rentals_dates_valid" CHECK (due_date > start_date)`, { transaction });
      await context.addIndex('rentals', ['start_date', 'due_date'], {
        name: 'rentals_availability_idx',
        transaction,
      });
    });
  }

  export async function down({ context }: { context: QueryInterface }) {
    await context.sequelize.transaction(async (transaction) => {
      await context.dropTable('rentals', { transaction });
    });
  }
