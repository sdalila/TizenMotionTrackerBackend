const express = require('express');
const fs = require('fs');
const sanitize = require("sanitize-filename");
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.get('/files', (_, res) => {
    const files = fs.readdirSync(".").map(file => { return {
        filename: file,
        date: fs.statSync(file).birthtime
    }});
    res.render('files', {
        files: files.filter(file => file.filename.endsWith('.csv'))
    });
});

app.get('/getfile/:filename', (req, res) => {
    if (req.params.filename && req.params.filename.endsWith('.csv')) {
        res.sendFile(__dirname + "/" + req.params.filename);
    } else {
        res.sendStatus(404);
    }
});

app.use(bodyParser.text({
    type: ["text/csv", "application/csv"],
    limit: '100mb'
}));

app.post('/addcsv', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
        const timestamp = (new Date()).toJSON();
        fs.writeFileSync(sanitize(timestamp + ".csv"), req.body.toString());
        res.send();
    } catch(err)
    {
        res.sendStatus(500);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
