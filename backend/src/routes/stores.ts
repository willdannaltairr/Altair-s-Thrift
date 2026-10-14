import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createStoreSchema, updateStoreSchema } from '../validators/store.js';
import { listStores, getStore, createStore, patchStore, myStores } from '../controllers/stores.js';

const r = Router();
r.get('/', listStores);
r.get('/mine', requireAuth, myStores);
r.get('/:slug', getStore);
r.post('/', requireAuth, validate(createStoreSchema), createStore);
r.patch('/:id', requireAuth, validate(updateStoreSchema), patchStore);
export default r;
