const infos = [
	{
		priority: 1,
		enabled: true,
		title: 'Public announcement',
		identifier: "survivors-count",
		body: '<div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 5vw; font-family: Oxanium">Total souls alive <p style="font-size: 7vw;"><span class="survivors">%%survivor_count%%</span></p></div>',
	},
];

exports.seed = async knex => {
	await knex('infoboard_entry').del();
	await knex('infoboard_entry').insert(infos);
	await knex('infoboard_priority').del();
	await knex('infoboard_priority').insert({ priority: 1 });
};
