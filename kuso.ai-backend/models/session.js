const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Function to create a session
const createSession = async (data) => {
    return prisma.session.create({
        data: {
            user: { connect: { userId: data.userId } },
        },
        include: {
            user: true,
            questions: true,
            feedback: true,
        }
    });
};

// Function to get all sessions
const getAllSessions = async (filters) => {
    let where = {};

    if (filters.userId) {
        where.userId = parseInt(filters.userId);
    }
    
    return prisma.session.findMany({
        where: Object.keys(where).length ? where : undefined,
        include: {
            user: true,
            questions: {
                include: {
                    question: true,
                    feedback: true,
                }
            },
            feedback: true,
        },
    });
};

// Function to update session
const updateSession = async (id, sessionData) => {
    return prisma.session.update({
        where: { sessionId: parseInt(id) },
        data: sessionData,
        include: {
            user: true,
            questions: {
                include: {
                    question: true,
                    feedback: true,
                }
            },
            feedback: true,
        }
    });
};

// Function to get session by id
const getSessionById = async (id) => {
    return prisma.session.findUnique({
        where: { sessionId: parseInt(id) },
        include: {
            user: true,
            questions: {
                include: {
                    question: true,
                    feedback: true,
                }
            },
            feedback: true,
        },
    });
};

// Function to delete session
const deleteSession = async (id) => {
    return prisma.session.delete({
        where: { sessionId: parseInt(id) }
    });
};

// Function to add sessionQuestion to session
const addSessionQuestion = async (id, sessionQuestionData) => {
    return prisma.sessionQuestion.create({
        data: {
            session: { connect: { sessionId: parseInt(id) } },
            question: { connect: { questionId: sessionQuestionData.questionId } },
            askedAt: new Date(),
            isGenerated: sessionQuestionData.isGenerated,
        },
        include: {
            session: true,
            question: true,
        }
    });
};

// Function to add feedback to session
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
    createSession,
    getAllSessions,
    getSessionById,
    deleteSession,
    updateSession,
    addSessionQuestion,
    addFeedback,
};