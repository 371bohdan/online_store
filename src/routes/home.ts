import { Router } from 'express';

import { getHome } from '../controllers/homeController'; // потім замінити на інше це лише шаблон

const routerHome = Router();

routerHome.get('/', getHome);

export default routerHome;
