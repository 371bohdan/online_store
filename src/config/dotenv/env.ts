import zod from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = zod.object({

    PORT: zod.string().default('3000').refine(
        (port) => parseInt(port) > 0 && parseInt(port) < 65536,
        'Invalid port number'
    ),

    MONGODB_URI: zod.string().refine(
        (mongo) => mongo.startsWith('mongodb+srv://admin:'),
        'Invalid URI on mongodb'
    ),

    MAIL_USER: zod.string().refine(
        (user) => user.includes('@'),
        'Invalid user mail'
    ),

    MAIL_PASSWORD: zod.string().refine(
        (password) => password.length >= 8,
        'Invalid mail password'
    ),

    SUPABASE_BUCKET_NAME: zod.string(),
    SUPABASE_KEY: zod.string(),

    SUPABASE_URL: zod.string().refine(
        (url) => url.startsWith('https://') && url.endsWith('.supabase.co'),
        'Invalid supabase URI'
    ),

    HOST_URI: zod.string().refine(
        (url) => url.startsWith('http://') || url.startsWith('https://'),
        'Invalid host URI'
    ),

    JWT_ACCESS_SECRET_KEY: zod.string().refine(
        (secretKey) => secretKey.length >= 8,
        'Invalid jwt access secret key'
    ),

    JWT_REFRESH_SECRET_KEY: zod.string().refine(
        (secretKey) => secretKey.length >= 8,
        'Invalid jwt refresh secret key'
    ),

    JWT_ACCESS_TOKEN_EXPIRES: zod.string()
        .regex(/^\d+$/, 'Must be a number')
        .transform((val) => Number(val)),

    JWT_REFRESH_TOKEN_EXPIRES: zod.string()
        .regex(/^\d+$/, 'Must be a number')
        .transform((val) => Number(val)),

    OWNER_EMAIL: zod.string().email('Invalid email format'),

    MAIL_CODES_EXPIRY_TIME: zod.string()
        .regex(/^\d+$/, 'Must be a number')
        .transform((val) => Number(val)),

});

type Env = zod.infer<typeof envSchema>;
export const ENV: Env = envSchema.parse(process.env);