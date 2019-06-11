exports.up = async knex => {
	await knex.schema.createTable('sip_contact', t => {
		t.string('id').primary(); // Also acts as the number that is used when registering to SIP
		t.string('name'); // Contact display name
		t.string('type'); // If we want types like MEDBAY so that we can show a icon in frontend
		t.boolean('video_allowed').defaultTo(false); // If video calls to/from this contact are allowed
		t.timestamps(true, true);
	});
};

exports.down = async knex => {
	await knex.schema.dropTable('sip_contact');
};
