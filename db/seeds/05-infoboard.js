const infos = [
	{
		priority: 7,
		enabled: true,
		title: 'Jump prep started',
		body: '<p text-align="center">The ship is now preparing for a jump.</p>',
	},
	{
		priority: 8,
		enabled: true,
		title: 'Jump prep completed',
		body: '<b text-align="center">The ship is now ready to jump at a short notice.</b>',
	},
	{
		priority: 9,
		enabled: true,
		title: 'Jump sequence initiated',
		body: '<b text-align="center">Jump in %%JUMP%% seconds.</b>',
	},
	{
		priority: 1,
		enabled: true,
		title: 'Public announcement',
		identifier: "survivors-count",
		body: '<div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 5vw;">Total souls alive <p style="font-size: 7vw; font-family: Oxanium;"><span class="survivors">%%survivor_count%%</span></p></div>',
	},
];

exports.seed = async knex => {
	await knex('infoboard_entry').del();
	await knex('infoboard_entry').insert(infos);
	await knex('infoboard_priority').del();
	await knex('infoboard_priority').insert({ priority: 1 });
};
