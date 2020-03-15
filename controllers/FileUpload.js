import fs from 'fs';
import crypto2 from 'crypto2';
import path from 'path';
import chalk from 'chalk';
import {fetchIPAddress, countNumberOfDownloadsPerIP} from './utils';

// Map to record daily download count per IP address
let requestsPerIpMap = new Map();

/**
 * Route Hanlder for Uploading files to the file server dierctory defined by process env variable: FOLDER
 * @param {*} req : Request object containing files uploaded 
 * @param {*} res : Respose object containing the response under key data: {publicKey: ae73c78d, privateKey: d2c95ee}
 * @param {*} next 
 */
export const uploadFiles = async (req, res, next) => {
    let response = [];
    const {CRYPTO_PRIVATE_PASSKEY, CRYPTO_PUBLIC_PASSKEY, iv} = process.env;
    console.log(`${chalk.green('✓')} Writing files to directory: ${process.env.FOLDER}`);

    for (const file of req.files) {
        const privateKey = await crypto2.encrypt(file.filename, CRYPTO_PRIVATE_PASSKEY, iv);
        const publicKey = await crypto2.encrypt(file.filename, CRYPTO_PUBLIC_PASSKEY, iv);
        response.push({ publicKey, privateKey })
    }
    res.json({ success: 'Uploaded file(s) successfully', data: response})
}

/**
 * Route handler for fetching the files in the server based on the publicKey 
 * @param {*} req Containing the publicKey in the query param (ex: files/ae73c78d )
 * @param {*} res 
 * @param {*} next 
 */
export const getFiles = async (req, res, next) => {
    let ipAddress = fetchIPAddress(req);
    let noOfDownloadsPerDayForIP = countNumberOfDownloadsPerIP(ipAddress, requestsPerIpMap);

    const {CRYPTO_PUBLIC_PASSKEY, iv, FOLDER} = process.env;
    const fileNameToRead = await crypto2.decrypt(req.params.publicKey, CRYPTO_PUBLIC_PASSKEY, iv);

    let filePath = path.join(FOLDER, fileNameToRead); 

    fs.exists(filePath, async fileExistsError => {
        if (!fileExistsError) {
            res.send(`File cannot be accessed due to: ${fileExistsError}`)
        }
        try {
            if(noOfDownloadsPerDayForIP <= process.env.DAILY_DOWNLOAD_PER_IP) {
                await res.sendFile(filePath)
            } else {
                res.status(403).json({error: "Exceeded configured daily download !!"});
            }
        } catch (fileReadError) {
            res.status(500).json({error: `Unable to read file due to: ${fileReadError}`})
        }
    })
}

/**
 * Route handler for deleting a file
 * @param {*} req Containing the privateKey in the query param (ex: /files/d2c95ee)
 * @param {*} res 
 * @param {*} next 
 */
export const deleteFile = async (req, res, next) => {
    const {CRYPTO_PRIVATE_PASSKEY, iv, FOLDER} = process.env;
    const fileNameToDelete = await crypto2.decrypt(req.params.privateKey, CRYPTO_PRIVATE_PASSKEY, iv);
    let filePath = path.join(FOLDER, fileNameToDelete);
    fs.unlink(filePath, (err) => {
        if (err) {
            res.status(500).json({error: `Unable to delete file due to ${err}`});
        } else {
            res.json({success: `Deleted file at ${filePath} successfully `});
        }
    });
}

/**
 * Function to reset the daily download limits for an IP address
 */
setInterval(() => {
    console.log('*** Resetting the daily download limit ***');
    requestsPerIpMap = new Map();
}, 86400000);