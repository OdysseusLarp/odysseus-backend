import test from 'ava';
import request from 'supertest';
import { app } from '../src';

test('should respond to root query', async t => {
	const res = await request(app).get('/');
	t.is(res.text, 'Odysseus backend');
	t.is(res.status, 200);
});

/*
** Starmap
*/
test('should get data of current grid', async t => {
	const res = await request(app).get('/starmap/grid');
	t.is(res.status, 200);
	t.deepEqual(res.body, {});
});

/*
** Fleet
*/
test('should get status of the whole fleet', async t => {
	const res = await request(app).get('/fleet');
	t.is(res.status, 200);
	t.deepEqual(res.body, {});
});

/*
** Engineering
*/
test('should get list of all broken things and tasks', async t => {
	const res = await request(app).get('/engineering');
	t.is(res.status, 200);
	t.deepEqual(res.body, {});
});
