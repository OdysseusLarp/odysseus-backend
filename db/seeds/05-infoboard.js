const infos = [
    {
	priority: 1,
	enabled: true,
	title: 'Test slide 1',
	body: '<b>Simple bold text line</b>'
    },
    {
	priority: 1,
	enabled: true,
	title: 'Test slide 2',
	body: '<p>Just regular text</p>'
    }
];

exports.seed = async knex => {
    await knex('infoboard_entry').del();
    await knex('infoboard_entry').insert(infos);
};
