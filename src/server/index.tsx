declare var PROCESS_PORT: any;

import express from 'express';
import path from 'path';
import fs from 'fs';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import * as templates from './templates';
const marketingTemplate = require('./templates/marketing.pug')();

const server = express();

server.use(morgan('dev'));
server.use(bodyParser.json());
server.use(
  express.static(path.resolve(fs.realpathSync(process.cwd()), 'build'), {
    index: false
  })
);

server.get('/', (_, res) => {
  res.send(marketingTemplate);
});

server.get('/app', (req, res) => {
  res.send(templates.App(req));
});

server.all('*', (_, res) => {
  res.redirect('/');
});

server.listen(PROCESS_PORT || 8080);
