import { DataTypes, literal, type QueryInterface } from 'sequelize';

export async function up(context: QueryInterface) 
  {
    await context.sequelize.transaction(async (transaction) => {
      await context.createTable('return_inspections', {
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
          unique: true,
        },
        condition: {
          type: DataTypes.ENUM('GOOD', 'DAMAGED', 'MISSING_PARTS', 'UNUSABLE'),
          allowNull: false,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        good_quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        damaged_quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        inspected_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
      }, { transaction });
      await context.sequelize.query(`ALTER TABLE "return_inspections" ADD CONSTRAINT "return_inspections_quantities_valid" CHECK (good_quantity >= 0 AND damaged_quantity >= 0 AND good_quantity + damaged_quantity > 0)`, { transaction });
      await context.sequelize.query(`ALTER TABLE "return_inspections" ADD CONSTRAINT "return_inspections_notes_required" CHECK (condition = 'GOOD' OR (notes IS NOT NULL AND btrim(notes) <> ''))`, { transaction });
    });
  }

  export async function down({ context }: { context: QueryInterface }) {
    await context.sequelize.transaction(async (transaction) => {
      await context.dropTable('return_inspections', { transaction });
      await context.sequelize.query('DROP TYPE IF EXISTS "enum_return_inspections_condition"', { transaction });
    });
  }
