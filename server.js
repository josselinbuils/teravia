const express = require('express');
const serveStatic = require('serve-static');

const PORT = 9000;

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('X-Frame-Options', 'ALLOW-FROM http://localhost:4200');
    next();
});

app.use(process.env.HTTP_PREFIX || '/', serveStatic('dist'));

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));