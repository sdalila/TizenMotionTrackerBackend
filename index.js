const express = require('express');
const fs = require('fs');
const sanitize = require("sanitize-filename");
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const send = require('gmail-send');

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
        const filename = sanitize(timestamp + ".csv");
        fs.writeFileSync(filename, req.body.toString());
        res.send();
        send({
            user:  'HrAccTizen.data@gmail.com',
            pass:  'HrAccData123.',
            subject:'Data for ' + timestamp,
            to:    'HrAccTizen.data@gmail.com',
            files: [filename],
        })();
    } catch(err)
    {
        res.sendStatus(500);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
