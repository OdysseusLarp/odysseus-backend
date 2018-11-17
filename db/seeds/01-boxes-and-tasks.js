
const genericTask = { description: 'Lorem ipsum', systems: '{ "engineering" }', is_active: false };

const tasks = [
	{ ...genericTask, name: 'Test Task 1', type: 'SCHEDULED' },
	{ ...genericTask, name: 'Test Task 2', type: 'SCHEDULED' },
	{ ...genericTask, name: 'Test Task 3', type: 'SCHEDULED' },
	{ ...genericTask, name: 'Test Task 4', type: 'GM' },
];

const boxes = [
	{ id: 'example-box', value: '{ "value": 100  }', version: 1 },
	{ id: 'another-box', value: '{ "whatever_key": "whatever_value", "is_example": true }', version: 1 }
];

exports.seed = async knex => {
	await knex('task').del();
	await knex('box').del();
	await knex('task').insert(tasks);
	await knex('box').insert(boxes);
};
