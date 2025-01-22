"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const genericCrudController = (Model) => ({
    getAll: async (req, res) => {
        const items = await Model.find();
        res.json(items);
    },
    getById: async (req, res) => {
        const { id } = req.params;
        const item = await Model.findById(id);
        res.json(item);
    },
    create: async (req, res) => {
        const item = new Model(req.body);
        res.status(201).json(await Model.create(item));
    },
    update: async (req, res) => {
        const { id } = req.params;
        const updatedItem = await Model.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
        res.json(updatedItem);
    },
    removeById: async (req, res) => {
        const { id } = req.params;
        await Model.findByIdAndDelete(id);
        res.send(`${Model.modelName} with id '${id}' was successfully removed.`);
    },
    removeAll: async (req, res) => {
        await Model.deleteMany({});
        res.send('success');
    }
});
exports.default = genericCrudController;
