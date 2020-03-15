### Run the app
`npm run start`

### Accessing the app:
http://localhost:3001

### Route definitions:
Upload files using: (POST)
http://localhost:3001/files and choose formdata as input

Retreive files using: (GET)
http://localhost:3001/files/:publicKey

Delete files using: (DELETE)
http://localhost:3001/files/:privatekey


#### Modules used:
Foundation: express body-parser morgan multer dotenv errorhandler chalk

Transpiling: @babel/cli @babel/core @babel/node @babel/preset-env @babel/plugin-transform-runtime

Unit testing: chai mocha nyc sinon sinon-chai


### Logic used: 
The public and private passwords can be created using the crypto2 module.
The values used here are needed because if the service goes down, we need this to decrypt the files encrypted and stored on the file system in the previous service executions. Hence, these are not generated every time!!

Note: every file uploaded gets a new public and private key combination. 
Uploading the same file (even with same fielname) again will generate a new key pair and the old one will not work anymore.

### TODO:
 Due to lack of time I couldn't add unit  and integration tests
 
 I couldn't add a server's idle timeout as I wasnt clear is that a timeout on session or on the API.

 I can do the above with more time and also add a integration to a google cloud file server.
