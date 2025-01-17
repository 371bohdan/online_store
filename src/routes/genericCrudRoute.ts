import express from 'express';
import genericCrudController from '../controllers/genericCrudController';
import { Document, Model } from 'mongoose';

const genericCrudRoute = <T extends Document>(Model: Model<T>): express.Router => {
    const router: express.Router = express.Router();
    const controller = genericCrudController(Model);

    router.get('/', controller.getAll);
    router.get('/:id', controller.getById);
    router.post('/', controller.create);
    router.put('/:id', controller.update);
    router.delete('/', controller.removeAll);
    router.delete('/:id', controller.removeById);
    return router;
}

export default genericCrudRoute;