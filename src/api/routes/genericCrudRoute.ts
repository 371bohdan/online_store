import express from 'express';
import genericCrudController from '../controllers/genericCrudController';
import { Document, Model } from 'mongoose';
import requireAuth from '../middleware/auth/requireAuth';
import requireAdminOrOwnerRole from '../middleware/auth/requireAdminOrOwnerRole';
import { genericCrudService } from '../services/genericCrudService';
import errorHandler from '../middleware/errors/errorHandler';
import { swaggerService } from '../services/auxiliary/swaggerService';

const genericCrudRoute = <T extends Document>(Model: Model<T>, modelName: string, methodsToSecure: Array<string>): express.Router => {
    const router: express.Router = express.Router();
    const service = genericCrudService<T>(Model);
    const controller = genericCrudController(service);

    //routes
    if (methodsToSecure.includes('get')) {
        router.get('/', requireAuth, requireAdminOrOwnerRole, controller.getAll);
        router.get('/:id', requireAuth, requireAdminOrOwnerRole, controller.getById);
    } else {
        router.get('/', controller.getAll);
        router.get('/:id', controller.getById);
    }

    if (methodsToSecure.includes('post')) {
        router.post('/', requireAuth, requireAdminOrOwnerRole, controller.create);
    } else {
        router.post('/', controller.create);
    }

    if (methodsToSecure.includes('put')) {
        router.put('/:id', requireAuth, requireAdminOrOwnerRole, controller.update);
    } else {
        router.put('/:id', controller.update);
    }

    if (methodsToSecure.includes('delete')) {
        router.delete('/', requireAuth, requireAdminOrOwnerRole, controller.removeAll);
        router.delete('/:id', requireAuth, requireAdminOrOwnerRole, controller.removeById);
    } else {
        router.delete('/', controller.removeAll);
        router.delete('/:id', controller.removeById);
    }

    //swagger
    swaggerService.addDynamicSwaggerDocs(modelName, methodsToSecure);

    router.use(errorHandler);
    return router;
}

export default genericCrudRoute;