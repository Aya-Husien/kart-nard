import { DataTypes, literal, type QueryInterface } from 'sequelize';

export async function up(context: QueryInterface) 
  {
    await context.sequelize.transaction(async (transaction) => {
      await context.createTable('rental_extensions', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        rental_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'rentals', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        previous_due_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        new_due_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        additional_days: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        additional_cost: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
        },
        performed_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        idempotency_key: {
          type: DataTypes.STRING(128),
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
      }, { transaction });
      await context.sequelize.query(`ALTER TABLE "rental_extensions" ADD CONSTRAINT "rental_extensions_values_valid" CHECK (additional_days > 0 AND additional_cost >= 0 AND new_due_date > previous_due_date)`, { transaction });
      await context.addIndex('rental_extensions', ["performed_by", "idempotency_key"], { name: 'rental_extensions_idempotency_uq', unique: true, transaction });
      await context.addIndex('rental_extensions', ["rental_id"], { name: 'rental_extensions_rental_idx', unique: false, transaction });
    });
  }

  export async function down({ context }: { context: QueryInterface }) {
    await context.sequelize.transaction(async (transaction) => {
      await context.dropTable('rental_extensions', { transaction });
    });
  }
