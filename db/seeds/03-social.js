const posts = [
	{
		person_id: '20000',
		title: 'The Cosmos Awaits',
		body: `Extraordinary claims require extraordinary evidence realm of the galaxies **Drake Equation** dispassionate extraterrestrial observer Sea of Tranquility across the centuries. A mote of dust suspended in a sunbeam a very small stage in a vast cosmic arena rings of Uranus muse about the only home we've ever known encyclopaedia galactica. A still more glorious dawn awaits laws of physics invent the universe preserve and cherish that pale blue dot network of wormholes vanquish the impossible?

Not a *sunrise* but a *galaxyrise* a still more glorious dawn awaits astonishment Vangelis circumnavigated explorations. Two ghostly white figures in coveralls and helmets are soflty dancing vanquish the impossible concept of the number one vastness is bearable only through love inconspicuous motes of rock and gas vanquish the impossible. Muse about light years the sky calls to us with pretty stories for which there's little good evidence at the edge of forever vastness is bearable only through love and billions upon billions upon billions upon billions upon billions upon billions upon billions.`,
		type: 'NEWS',
		is_visible: true,
		status: 'APPROVED'
	},
	{
		person_id: '20001',
		title: 'Hearts of the stars corpus',
		body: `Tingling of the spine permanence of the stars prime number two ghostly white figures in coveralls and helmets are soflty dancing science the only home we've ever known. Orion's sword how far away venture rich in heavy atoms invent the universe with pretty stories for which there's little good evidence. Courage of our questions finite but unbounded brain is the seed of intelligence network of wormholes a very small stage in a vast cosmic arena are *creatures of the cosmos*.

## This is a markdown subtitle
Sea of Tranquility tesseract light years citizens of distant epochs **Hypatia dispassionate extraterrestrial** observer. Take root and flourish the ash of stellar alchemy rings of Uranus shores of the cosmic ocean hundreds of thousands tendrils of gossamer clouds. Take root and flourish not a sunrise but a galaxyrise another world not a sunrise but a galaxyrise not a sunrise but a galaxyrise extraordinary claims require extraordinary evidence. Not a sunrise but a galaxyrise rich in heavy atoms invent the universe not a sunrise but a galaxyrise shores of the cosmic ocean another world and billions upon billions upon billions upon billions upon billions upon billions upon billions.`,
		type: 'NEWS',
		is_visible: true,
		status: 'APPROVED'
	},
	{
		person_id: '20002',
		title: 'I like turtles',
		body: `List of my favorite animals:
* Turtles
* Turtles
* Turtles

That's just **my** 5 cents.`,
		type: 'OPINION',
		is_visible: true,
		status: 'APPROVED'
	},
	{
		person_id: '20003',
		title: 'Initial test entry',
		body: `This is a test entry for captain's log.

## Markdown styling
Yup, markdown *should* work. Here is a dog:

![Yup, it's a dog](https://odysseus.nicou.me/staticfiles/doge.jpg)`,
		type: 'CAPTAINS_LOG',
		is_visible: true,
		status: 'APPROVED'
	},
];

const votes = [
	{
		id: 1,
		person_id: '20000',
		title: 'Cats vs dogs',
		description: 'Cats and dogs are the most popular pets in the world. Cats are more independent and are generally cheaper and less demanding pets. Dogs are loyal and obedient but require more attention and exercise, including regular walks.',
		active_until: '2019-07-14T19:51:39.185Z',
		is_active: true,
		status: 'APPROVED'
	},
	{
		id: 2,
		person_id: '20001',
		title: 'Lötkö vs mötkö',
		description: ' Kuvaajan iloa ei mitenkään hämmennä se, että hänen kalan nostanut kaverinsa satuttaa itsensä toimituksessa. Videon kommenttipalstalla suurta debattia on aiheuttanut kysymys siitä, sanoiko kuvaaja "lötkö" vai "mötkö".',
		active_until: '2019-07-14T19:51:39.185Z',
		is_active: true,
		status: 'APPROVED'
	},
	{
		id: 3,
		person_id: '20002',
		title: 'Best color',
		description: 'We need to decide which color is the best.',
		active_until: '2019-06-02T19:52:48.683Z',
		is_active: false,
		status: 'APPROVED'
	}
];

const voteOptions = [
	{ id: 1, vote_id: 1, text: 'Cat' },
	{ id: 2, vote_id: 1, text: 'Dog' },
	{ id: 3, vote_id: 2, text: 'Lötkö' },
	{ id: 4, vote_id: 2, text: 'Mötkö' },
	{ id: 5, vote_id: 3, text: 'Red' },
	{ id: 6, vote_id: 3, text: 'Blue' },
	{ id: 7, vote_id: 3, text: 'Green' },
	{ id: 8, vote_id: 3, text: 'Yellow' },
];

const voteEntries = [
	{ person_id: '20000', vote_id: 1, vote_option_id: 1 },
	{ person_id: '20001', vote_id: 2, vote_option_id: 4 },
	{ person_id: '20002', vote_id: 3, vote_option_id: 7 },
];

const channels = [
	{ id: 'general', description: 'General banter' },
	{ id: 'engineers', description: 'Engineering talk' },
	{ id: 'medics', description: 'Medic stuff' }
];

const logs = [
	{
		ship_id: 'odysseus',
		type: 'INFO',
		message: 'Ship preparing for jump to sector ABC'
	},
	{
		ship_id: 'odysseus',
		type: 'SUCCESS',
		message: 'Ship jump completed to sector ABC'
	},
	{
		ship_id: 'odysseus',
		type: 'WARNING',
		message: 'Problems detected in ship life support systems'
	},
	{
		ship_id: 'odysseus',
		type: 'SUCCESS',
		message: 'Ship life support systems have been fixed and are functioning at 100% capacity'
	}
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
	await knex('vote').insert(votes);
	await knex('vote_option').insert(voteOptions);
	await knex('vote_entry').insert(voteEntries);
	await knex('com_channel').insert(channels);
	await knex('ship_log').insert(logs);
	// fix the primary key sequences to avoid duplicates after using manual id's
	await knex.raw(`SELECT setval('vote_option_id_seq', 9)`);
	await knex.raw(`SELECT setval('vote_id_seq', 4)`);
};
