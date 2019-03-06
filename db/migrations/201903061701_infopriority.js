exports.up = async knex => {
    await knex.schema.createTable('infoboard_priority', t => {
	t.integer('priority').notNullable();
	t.timestamps(true,true);
    });
};

exports.down = async knex => {
    await knex.raw('DROP TABLE IF EXISTS infoboard_priority');
};
