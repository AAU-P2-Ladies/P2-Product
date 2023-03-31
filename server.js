const express = require('express')
const path = require('path')
var fs = require('fs'), json;

const app = express()

const port = 3000
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/html/index.html'))

})

app.listen(port, () => {

    console.log(`Server listening at http://localhost:${port}`)

})


   
function readJsonFileSync(filepath, encoding){

    if (typeof (encoding) == 'undefined'){
        encoding = 'utf8';
    }
    var file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}
    
function getConfig(file){
    
    var filepath = __dirname + '/' + file;
    return readJsonFileSync(filepath);
}
    

