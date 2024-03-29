import 'dotenv/config';
import { Knex } from 'knex';

const knexConfig: Knex.Config = {
	client: 'pg',
	// debug: process.env.NODE_ENV !== 'production',
	debug: false,
	connection: {
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT, 10),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		charset: 'UTF8_GENERAL_CI'
	},
	pool: {
		min: 2,
		max: 10,
	},
	migrations: {
		tableName: `knex_migrations`,
		directory: `${__dirname}/db/migrations`
	},
	seeds: {
		directory: `${__dirname}/db/seeds`
	}
};

export default knexConfig;
