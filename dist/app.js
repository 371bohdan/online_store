"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const home_1 = __importDefault(require("./routes/home")); // потім можна змінити на інший котрий потрібен маршрут
const dotenv = __importStar(require("dotenv")); //зберігання необхідних даних (необов'язково але на випадок якщо потрібно сховати конф дані) 
dotenv.config();
const genericCrudRoute_1 = __importDefault(require("./routes/genericCrudRoute"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerOptions_1 = __importDefault(require("./swagger/swaggerOptions"));
const users_1 = __importDefault(require("./models/users"));
const products_1 = __importDefault(require("./models/products"));
//entry point
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const run = () => {
    app.listen(port, () => {
        console.log(`This server runs on http://localhost:${port}`);
    });
};
run();
//inital home routes
app.use(express_1.default.json());
app.use('/', home_1.default);
//database connection
mongoose_1.default.connect(process.env.MONGODB_URI || '');
//user routes
const userRoute = (0, genericCrudRoute_1.default)(users_1.default, "users");
const productRoute = (0, genericCrudRoute_1.default)(products_1.default, "products");
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);
//auth routes
const authRoute_1 = __importDefault(require("./routes/authRoute"));
app.use('/api/auth', authRoute_1.default);
//swagger
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerOptions_1.default));
// // Налаштування транспорту для nodemailer
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });
// // Функція для відправки листа
// const sendEmail = async (to: string, subject: string, text: string) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     text,
//   };
//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };
// // Виклик функції для відправки листа на певну пошту
// sendEmail('bohdanmagpie@gmail.com', 'Test Subject', 'This is a test email.')
//   .then(() => console.log('Email successfully sent'))
//   .catch((error) => console.log('Failed to send email:', error));
