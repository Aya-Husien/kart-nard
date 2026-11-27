import 'dotenv/config';
import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import { pathToFileURL } from 'node:url';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing');
}

const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
});

const migrator = new Umzug({
    migrations: {
        glob: 'database/migrations/*.ts',
        resolve: ({ name, path, context }) => ({
            name,
            up: async () => {
                const migration = await import(pathToFileURL(path!).href);
                await migration.up({ context });
            },
            down: async () => {
                const migration = await import(pathToFileURL(path!).href);
                await migration.down({ context });
            },
        }),
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
});

async function main() {
    try {
        await sequelize.authenticate();
        await migrator.runAsCLI();
    } finally {
        await sequelize.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});