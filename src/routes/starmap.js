import { Router } from 'express';
const router = new Router();

router.get('/grid', (req, res) => {
	// TODO: Return data of the current grid that Odysseus is in
	const grid = {};
	res.json(grid);
});

router.get('/grid/:id', (req, res) => {
	const { id } = req.params;
	// TODO: Return data of the grid with the provided ID
	const grid = { id };
	res.json(grid);
});

router.post('/grid/:id', (req, res) => {
	const { id } = req.params;
	const { action } = req.body;
	switch (action) {
		case 'JUMP': {
			// TODO: Jump logic, jump to grid with given ID
			break;
		}
		case 'SCAN': {
			// TODO: Scan logic, scan the grid with given ID
			break;
		}
		default: {
			// TODO: Error message if action is unknown
		}
	}
	// TODO: Return output of the given action
	const data = { id };
	res.json(data);
	req.io.to('starmap').emit('gridAction', data);
});

router.get('/object/:id', (req, res) => {
	const { id } = req.params;
	// TODO: Return data of the object with given ID
	const data = { id };
	res.json(data);
});

router.post('/object/:id', (req, res) => {
	const { id } = req.params;
	const { action } = req.body;
	switch (action) {
		case 'SEND_PROBE': {
			// TODO: Probe logic, send probe to the object with given ID
			break;
		}
		default: {
			// TODO: Error message if action is unknown
		}
	}
	// TODO: Return output of the given action
	const data = { id };
	res.json(data);
	req.io.to('starmap').emit('objectAction', data);
});

export default router;
