const express = require("express");
const app = express();
const cors = require("cors");
const authorize = require("./auth");
const fs = require("fs");
const {google} = require('googleapis');

app.use(cors())

app.get("/file",async (req,res)=>{

    const file_id = req.query.file_id;
    const filename = req.query.filename;
 
    const auth = await authorize();
    const service = google.drive({ version: 'v3', auth });


    const stream = await service.files.get({
        fileId: file_id,
        alt: 'media',
    },{ responseType: 'stream' });

    const file = fs.createWriteStream(`./tmp/${filename}`);

    const saveFile = new Promise((resolve,reject)=>{

        stream.data.on('data', function(chunk) {
            file.write(chunk);
          });
          stream.data.on('end', function() {
            file.end();
            resolve(true);
        });

    })
    
    await saveFile;

    res.download(`./tmp/${filename}`)


})

app.listen(3000,()=>{
    console.log("server listening in port 3000");
});