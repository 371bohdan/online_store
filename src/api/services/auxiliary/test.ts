import * as fs from 'fs';
import * as path from 'path';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';


const source = fs.readFileSync