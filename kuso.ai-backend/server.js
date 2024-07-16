require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require("morgan");
// const bodyParser = require('body-parser');

const questionRoute = require('./routes/questionRoutes');
const sessionRoute = require('./routes/sessionRoutes')

const app = express();

const PORT = 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get('/', (req, res) => 
    res.send("Hello World!")
)

app.use('/question', questionRoute);
app.use('/session', sessionRoute);

app.listen(PORT,()=>{
    console.log(`Server is running on port: http://localhost:${PORT}/`);
})
