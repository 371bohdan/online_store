"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const homeController_1 = require("../controllers/homeController"); // потім замінити на інше це лише шаблон
const routerHome = (0, express_1.Router)();
routerHome.get('/', homeController_1.getHome);
exports.default = routerHome;
