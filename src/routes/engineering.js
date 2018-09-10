import { Router } from 'express';
const router = new Router();

router.get('/', (req, res) => {
    // TODO: Return list of tasks / broken things
    const state = {};
    res.json(state);
});

router.get('/box', (req, res) => {
    // TODO: Return state of all boxes
    const state = [];
    res.json(state);
});

router.get('/box/:id', (req, res) => {
    const { id } = req.params;
    // TODO: Return state of the box with given ID
    const state = {};
    res.json(state);
});

router.post('/box/:id', (req, res, next) => {
    const { id } = req.params;
    // TODO: Set box state and return current state
    const state = {};
    res.json(state);
    req.io.to('engineering').emit('boxStateUpdated', state);
});

export default router;
