import { DataTypes, literal, type QueryInterface } from 'sequelize';

export async function up({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.createTable('verification_codes', {
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
      code_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET'),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      invalidated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal('CURRENT_TIMESTAMP'),
      },
    }, { transaction });
    await context.sequelize.query(`ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_attempts_nonnegative" CHECK (attempts >= 0)`, { transaction });
    await context.sequelize.query(`ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_expiry_valid" CHECK (expires_at > created_at)`, { transaction });
    await context.addIndex('verification_codes', ["user_id", "type", "created_at"], { name: 'verification_codes_lookup_idx', unique: false, transaction });
    await context.sequelize.query(
      `CREATE UNIQUE INDEX verification_codes_one_open_idx ON verification_codes (user_id, type) WHERE used_at IS NULL AND invalidated_at IS NULL`,
      { transaction },
    );
  });
}

export async function down({ context }: { context: QueryInterface }) {
  await context.sequelize.transaction(async (transaction) => {
    await context.dropTable('verification_codes', { transaction });
    await context.sequelize.query('DROP TYPE IF EXISTS "enum_verification_codes_type"', { transaction });
  });
}
