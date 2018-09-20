
exports.seed = async knex => {
	await knex('task_requirement').del();
	await knex('task').del();
	await knex('box').del();

	await knex.raw(`INSERT INTO box (id, name) VALUES(1, 'Testiboksi 1')`);
	await knex.raw(`INSERT INTO box (id, name) VALUES(2, 'Testiboksi 2')`);
	await knex.raw(`INSERT INTO box (id, name) VALUES(3, 'Testiboksi 3')`);
	await knex.raw(`INSERT INTO box (id, name) VALUES(4, 'Testiboksi 4')`);

	await knex.raw(`INSERT INTO task (id, name, description, type, systems) VALUES (
		1,
		'Testitaski 1',
		'Testitaskin 1 kuvaus',
		'SCHEDULED',
		'{ "engineering" }'
	)`);
	await knex.raw(`INSERT INTO task (id, name, description, type, systems) VALUES (
		2,
		'Testitaski 2',
		'Testitaskin 2 kuvaus',
		'SCHEDULED',
		'{ "engineering" }'
	)`);
	await knex.raw(`INSERT INTO task (id, name, description, type, systems) VALUES (
		3,
		'Testitaski 3',
		'Testitaskin 3 kuvaus',
		'SCHEDULED',
		'{ "engineering" }'
	)`);
	await knex.raw(`INSERT INTO task (id, name, description, type, systems) VALUES (
		4,
		'Testitaski 4',
		'Testitaskin 4 kuvaus',
		'GM',
		'{ "engineering" }'
	)`);

	await knex.raw(`INSERT INTO task_requirement (id, task_id, box_id, requirements) VALUES (1, 1, 1, '{
			"type": "EQUAL",
			"value": "exact match required"
		}')`);

	await knex.raw(`INSERT INTO task_requirement (id, task_id, box_id, requirements) VALUES (2, 2, 2, '{
		"type": "RANGE",
		"value": { "lower": 60, "upper": 150 }
	}')`);

	await knex.raw(`INSERT INTO task_requirement (id, task_id, box_id, requirements) VALUES (3, 3, 3, '{
		"type": "SOME",
		"value": ["can be this", "or this", 1337]
	}')`);

	await knex.raw(`INSERT INTO task_requirement (id, task_id, box_id, requirements) VALUES (4, 3, 4, '{
		"type": "EQUAL",
		"value": true
	}')`);

	await knex.raw(`INSERT INTO task_requirement (id, task_id, box_id, requirements) VALUES (5, 4, 4, '{
		"type": "EQUAL",
		"value": true
	}')`);
};
