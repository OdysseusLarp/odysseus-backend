
exports.seed = async knex => {
	await knex('task').del();

	await knex.raw(`INSERT INTO task (id, name, description, type, systems, is_active) VALUES (
		1,
		'Testitaski 1',
		'Testitaskin 1 kuvaus',
		'SCHEDULED',
		'{ "engineering" }',
		false
	)`);
	await knex.raw(`INSERT INTO task (id, name, description, type, systems, is_active) VALUES (
		2,
		'Testitaski 2',
		'Testitaskin 2 kuvaus',
		'SCHEDULED',
		'{ "engineering" }',
		false
	)`);
	await knex.raw(`INSERT INTO task (id, name, description, type, systems, is_active) VALUES (
		3,
		'Testitaski 3',
		'Testitaskin 3 kuvaus',
		'SCHEDULED',
		'{ "engineering" }',
		false
	)`);
	await knex.raw(`INSERT INTO task (id, name, description, type, systems, is_active) VALUES (
		4,
		'Testitaski 4',
		'Testitaskin 4 kuvaus',
		'GM',
		'{ "engineering" }',
		false
	)`);
};
