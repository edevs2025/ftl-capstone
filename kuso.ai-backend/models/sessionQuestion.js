const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Function to create a sessionQuestion
const createSessionQuestion = async (data) => {
    return prisma.sessionQuestion.create({
        data: {
            session: { connect: { sessionId: data.sessionId } },
            question: { connect: { questionId: data.questionId } },
            askedAt: data.askedAt || new Date(),
            isGenerated: data.isGenerated || false,
        },
        include: {
            session: true,
            question: true,
        }
    });
};

// Function to get all sessionQuestions
const getAllSessionQuestions = async (filters) => {
    let where = {};

    if (filters.sessionId) {
        where.sessionId = parseInt(filters.sessionId);
    }
    if (filters.questionId) {
        where.questionId = parseInt(filters.questionId);
    }
    
    return prisma.sessionQuestion.findMany({
        where: Object.keys(where).length ? where : undefined,
        include: {
            session: true,
            question: true,
            feedback: true,
        }
    });
};

// Function to update sessionQuestion
const updateSessionQuestion = async (sessionId, questionId, data) => {
    const existingData = await prisma.sessionQuestion.findUnique({
        where: { 
            sessionId_questionId: {
                sessionId: parseInt(sessionId),
                questionId: parseInt(questionId)
            }
        },
    });

    if (!existingData) {
        throw new Error('User not found');
    }

    const updatedData = {
        ...existingData,
        ...industryData,
    };
    return prisma.sessionQuestion.update({
        where: {
            sessionId_questionId: {
                sessionId: parseInt(sessionId),
                questionId: parseInt(questionId)
            }
        },
        data: updatedData
        ,
        include: {
            session: true,
            question: true,
            feedback: true,
        }
    });
};

// Function to get sessionQuestion by sessionQuestionId
const getSessionQuestionById = async (sessionQuestionId) => {
    return prisma.sessionQuestion.findUnique({
        where: {
            sessionQuestionId: parseInt(sessionQuestionId),
        },
        include: {
            session: true,
            question: true,
            feedback: true,
        }
    });
};

// Function to delete sessionQuestion
const deleteSessionQuestion = async (sessionQuestionId) => {
    return prisma.sessionQuestion.delete({
        where: {
             
            sessionQuestionId: parseInt(sessionQuestionId),
        }
    });
};

// Function to add feedback to sessionQuestion
const addFeedback = async (sessionId, questionId, feedbackData) => {
    return prisma.feedback.create({
        data: {
            score: feedbackData.score,
            gptResponse: feedbackData.gptResponse,
            userAnswer: feedbackData.userAnswer,
            sessionQuestion: {
                connect: {
                    sessionId_questionId: {
                        sessionId: parseInt(sessionId),
                        questionId: parseInt(questionId)
                    }
                }
            },
            session: { connect: { sessionId: parseInt(sessionId) } },
            question: { connect: { questionId: parseInt(questionId) } },
        },
        include: {
            sessionQuestion: true,
            session: true,
            question: true,
        }
    });
};

module.exports = {
    createSessionQuestion,
    getAllSessionQuestions,
    updateSessionQuestion,
    getSessionQuestionById,
    deleteSessionQuestion,
    addFeedback,
};