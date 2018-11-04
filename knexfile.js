require('dotenv').config({ silent: true });

module.exports = {
	client: 'pg',
	// debug: process.env.NODE_ENV !== 'production',
	debug: false,
	connection: {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		charset: 'UTF8_GENERAL_CI'
	},
	pool: {
		min: 2,
		max: 10,
		bailAfter: Infinity
	},
	migrations: {
		tableName: `knex_migrations`,
		directory: `${__dirname}/db/migrations`
	},
	seeds: {
		directory: `${__dirname}/db/seeds`
	}
};
