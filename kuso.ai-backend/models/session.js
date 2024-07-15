const {PrismaClient} = require("@prisma/client");
const { addFeedback } = require("../controllers/sessionController");
const prisma = new PrismaClient();


// Function to create a session
const createSession = async (data) => {
    return prisma.session.create({data});
};

// Function to get all sessions
const getAllSessions = async (filters)=>{
    let where = {};

     if(filters.user){
        where.user = {contains : filters.user}
    }
    
    return prisma.session.findMany({
        where: Object.keys(where).length  ? where : undefined,
        include: {
            feedback: true,
            questions: true, // Include associated cards
        },
    })
    };

// Function to update session
const updateSession = async (id, sessionData) => {
    return prisma.session.update({
        where: { sessionId: parseInt(id) },
        data: sessionData
    });
}

// Function to get session by id
const getSessionById = async(id) =>{
    return prisma.session.findUnique({
       where: {sessionId:parseInt(id)},
       include: {
        cards: true, // Include associated cards
    },
    });
   }    

// Function to delete session
const deleteSession = async (id) =>{
    return prisma.session.delete({
        where: {sessionId:parseInt(id)}
    })
};

// Function to add sessionQuestion to session
const addSessionQuestion = async (id, sessionQuestionData) => {
    return prisma.card.create({data : {
        sessionId: parseInt(id),
        questionId: sessionQuestionData.questionId,
        isGenerated: sessionQuestionData.isGenerated,
    }})
}

// Function to add sessionQuestiom to session
const addFeedback = async (id, feedbackData) => {
    return prisma.card.create({data : {
        score: feedbackData.score,
        gptResponse: feedbackData.gptResponse,
        userAnswer: feedbackData.userAnswer,
        sessionId: parseInt(id),
        questionId: feedbackData.questionId,
    }})
}

module.exports = {
    createSession,
    getAllSessions,
    getSessionById,
    deleteSession,
    updateSession,
    addSessionQuestion,
    addFeedback,
}