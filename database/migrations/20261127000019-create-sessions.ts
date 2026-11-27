import { type QueryInterface } from 'sequelize';

// Compatible with connect-pg-simple when tableName is 'sessions'.
export async function up(context: QueryInterface) 
  {
    await context.sequelize.transaction(async (transaction) => {
      await context.sequelize.query(`
      CREATE TABLE sessions (
        sid varchar NOT NULL PRIMARY KEY,
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      )`, { transaction });
      await context.addIndex('sessions', ['expire'], {
        name: 'sessions_expire_idx', transaction,
      });
    });
  }
  export async function down({ context }: { context: QueryInterface }) {
    await context.dropTable('sessions');
  }
