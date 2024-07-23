require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require("morgan");
// const bodyParser = require('body-parser');

const userRoute = require('./routes/userRoutes');
const industryRoute = require('./routes/industryRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const questionRoutes = require('./routes/questionRoutes');
const sessionQuestionRoutes = require('./routes/sessionQuestionRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const userController = require('./controllers/userController');


const app = express();

const PORT = 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get('/', (req, res) => 
    res.send("Hello World!")
)

app.use('/user', userRoute);
app.use('/industry', industryRoute);
app.use('/session', sessionRoutes);
app.use('/question', questionRoutes);
app.use('/session-question', sessionQuestionRoutes);
app.use('/feedback', feedbackRoutes);

app.post('/api/clerk-webhook', userController.handleClerkWebhook);


app.listen(PORT,()=>{
    console.log(`Server is running on port: http://localhost:${PORT}/`);
})
