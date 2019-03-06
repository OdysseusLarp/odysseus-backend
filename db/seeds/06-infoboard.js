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
    },
    {
	priority: 2,
	enabled: true,
	title: 'Higher priority test slide 1',
	body: '<p>Just regular text but at higher priority.</p>'
    },
    {
	priority: 2,
	enabled: true,
	title: 'Higher priority test slide 2',
	body: '<b>Just some bold text at higher priority.</b>'
    },
    {
	priority: 3,
	enabled: true,
	title: 'Top priority slide',
	body: '<b>This will not change.</b>'
    },
];

exports.seed = async knex => {
    await knex('infoboard_entry').del();
    await knex('infoboard_entry').insert(infos);
    await knex('infoboard_priority').del();
    await knex('infoboard_priority').insert({priority: 1});
};
