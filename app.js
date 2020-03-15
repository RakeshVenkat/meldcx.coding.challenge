/**
 * Module dependencies
 */
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
import errorHandler from 'errorhandler';
import chalk from 'chalk';
import multer from 'multer';


/**
 * Controllers
 */
import * as FileUploadController from './controllers/FileUpload';

/**
 * Use mode to control the environment. Use development mode by default.
 */
let mode = process.env.NODE_ENV? process.env.NODE_ENV : 'development';
mode = mode.trim();
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
//const envCustomFile = `.env.${mode}`;
//dotenv.config({ path: `.env.${mode}` });
dotenv.config({ path: `.env.${mode}`});

/**
 * Create the express server
 */
const app = express(); 
/**
 * Express configuration.
 */
app.set('host', process.env.HOSTNAME || '0.0.0.0');
app.set('port', process.env.PORT || 8080);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Multer configuration
 */
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.FOLDER)
  }
})
const upload = multer({ storage });
/**
 * Route definitions
 */
app.post('/files', upload.array('filesToUpload'), FileUploadController.uploadFiles);
app.get('/files/:publicKey', FileUploadController.getFiles);
app.delete('/files/:privateKey', FileUploadController.deleteFile);
/**
 * Error Handler.
 */
if (mode === 'development') {
    // only use in development
    app.use(errorHandler());
  } else {
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).send('Server Error');
    });
  }
  
  /**
   * Start Express server.
   */
  app.listen(app.get('port'), () => {
    console.log(`${chalk.green('✓')} App is running at http://localhost:${app.get('port')} in ${mode} mode`);
    console.log('  Press CTRL-C to stop\n');
  });
  
  module.exports = app;