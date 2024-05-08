const posts = [
	{
		person_id: '20263',
		title: 'Systems restored',
		body: `Database damage fixed. Systems back online. Could not restore all data. Missing: Captains log, Ship log, News, Messages, Votes, Science database prior to 131.542, 70% of the Hand Scanner (Hansca) database. Still assessing data.`,
		type: 'NEWS',
		is_visible: true,
		status: 'APPROVED'
	},
	{
		person_id: '20263',
		title: 'Systems restored',
		body: `Could not restore Captains log.`,
		type: 'CAPTAINS_LOG',
		is_visible: true,
		status: 'APPROVED'
	},
	{
		person_id: '20263',
		title: 'Public announcement',
		body: '<div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 5vw;">Total souls alive <p style="font-size: 7vw; font-family: Orbitron;">%%survivor_count%%</p></div>',
		type: 'NEWS',
		is_visible: true,
		status: 'APPROVED'
	},
	{
		person_id: '20263',
		title: 'Survival count',
		body: '<b text-align="center">Current survival count {{survival_count}}</b>',
		type: 'CAPTAINS_LOG',
		is_visible: true,
		status: 'APPROVED'
	},
];

// TODO: Remove channels as they are no longer used, but removing them
// might break something
const channels = [
	{ id: 'general', description: 'General banter' },
	{ id: 'engineers', description: 'Engineering talk' },
	{ id: 'medics', description: 'Medic stuff' }
];

const logs = [
	{
		ship_id: 'odysseus',
		type: 'INFO',
		message: 'Database restored. Ship log entries were corrupted.'
	},
];

exports.seed = async knex => {
	await knex('ship_log').del();
	await knex('com_message').del();
	await knex('com_channel').del();
	await knex('post').del();
	await knex('vote_entry').del();
	await knex('vote_option').del();
	await knex('vote').del();
	await knex('post').insert(posts);
	await knex('com_channel').insert(channels);
	await knex('ship_log').insert(logs);
};
