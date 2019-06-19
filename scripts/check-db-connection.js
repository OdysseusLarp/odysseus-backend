const knex = require('knex')(require('../knexfile'));
const shell = require('shelljs');

// Check that DB is up
knex.raw(`SELECT 1`).then(async () => {
	// Make sure that we have the latest migrations
	shell.exec('npm run db:migrate');

	// Check if we have any data in data blobs - if not, run seeds
	await knex('store').count({ count: '*' }).first().then(res => {
		const count = parseInt(res.count || 0, 10);

		if (count === 0) {
			console.log('Could not find saved data blobs, assuming this is an initial startup, running seeds...');
			shell.exec('npm run db:seed');
		}

		// Everything OK, exit with 0
		process.exit(0);
	});
}).catch(async err => {
	// 57P03 = The database is starting up
	// ECONNREFUSED = Not accepting connections yet, wait a bit longer
	if (err && err.code === 'ECONNREFUSED') {
		console.log('Database connection refused, sleeping for extra 5 seconds');
		await new Promise(resolve => setTimeout(() => resolve(), 5000));
	}
	process.exit(1);
});
