// Export all messages to Elasticsearch, so that the GM team can easily
// search for readily available messages in the following games

const knex = require('knex')(require('../knexfile'));
const { post } = require('axios');
const { chunk } = require('lodash');

const esUrl = 'http://192.168.1.2:9200';
const esIndex = 'odysseus-local-run';
const esType = 'messages';

const esFullUrl = `${esUrl}/${esIndex}/${esType}`;

async function getMessages() {
	const { rows } = await knex.raw(`
		SELECT
			person_id AS sender_id,
			target_person AS receiver_id,
			CONCAT(sender.first_name, ' ', sender.last_name) AS sender,
			CONCAT(receiver.first_name, ' ', receiver.last_name) AS receiver,
			sender.is_character AS sender_is_character,
			receiver.is_character AS receiver_is_character,
			m.message,
			m.created_at AS timestamp
		FROM com_message m
		INNER JOIN person sender ON (m.person_id = sender.id)
		INNER JOIN person receiver ON (m.target_person = receiver.id)
		--LIMIT 1`);
	const chunks = chunk(rows, 5);
	let progress = 0;
	for (const chunk of chunks) {
		await Promise.all([
			...chunk.map(row =>
				post(esFullUrl, row)
					.catch(err => console.log(err))
			)]
		).then(() => {
			progress += chunk.length;
			console.log(`[${progress}/${rows.length}] Inserted ${chunk.length} rows`);
		});
	}
	process.exit(0);
}

getMessages();
