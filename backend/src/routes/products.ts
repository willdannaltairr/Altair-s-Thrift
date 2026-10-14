import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators/product.js';
import { listProducts, getProduct, createProduct, updateProduct, archiveProduct, sellerProducts } from '../controllers/products.js';

const r = Router();
r.get('/', validate(productQuerySchema, 'query'), listProducts);
r.get('/seller/mine', requireAuth, sellerProducts);
r.get('/:slug', getProduct);
r.post('/', requireAuth, validate(createProductSchema), createProduct);
r.patch('/:id', requireAuth, validate(updateProductSchema), updateProduct);
r.delete('/:id', requireAuth, archiveProduct);
export default r;
