const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Function to create a question
const createQuestion = async (data) => {
    return prisma.question.create({
        data: {
            questionContent: data.questionContent,
            //keywords: data.keywords,
            users: data.users ? { connect: data.users.map(id => ({ userId: id })) } : undefined,
            industries: data.industries ? { connect: data.industries.map(id => ({ industryId: id })) } : undefined,
        },
        include: {
            users: true,
            industries: true,
        }
    });
};

// Function to get all questions
const getAllQuestions = async (filters) => {
    let where = {};

    if (filters.questionContent) {
        where.questionContent = { contains: filters.questionContent };
    }
    
    return prisma.question.findMany({
        where: Object.keys(where).length ? where : undefined,
        include: {
            users: true,
            industries: true,
            sessions: {
                include: {
                    session: true,
                    feedback: true,
                }
            },
        },
    });
};

// Function to update question
const updateQuestion = async (id, questionData) => {
    const existingData = await prisma.question.findUnique({
        where: { questionId: parseInt(id) },
    });

    if (!existingData) {
        throw new Error('User not found');
    }

    const updatedData = {
        ...existingData,
        ...questionData,
    };
    return prisma.question.update({
        where: { questionId: parseInt(id) },
        data: updatedData
        // {
        //     questionContent: questionData.questionContent,
        //     users: questionData.users ? {
        //         set: questionData.users.map(id => ({ userId: id }))
        //     } : undefined,
        //     industries: questionData.industries ? {
        //         set: questionData.industries.map(id => ({ industryId: id }))
        //     } : undefined,
        // }
        ,
        include: {
            users: true,
            industries: true,
            sessions: {
                include: {
                    session: true,
                    feedback: true,
                }
            },
        },
    });
};

// Function to get question by id
const getQuestionById = async (id) => {
    return prisma.question.findUnique({
        where: { questionId: parseInt(id) },
        include: {
            users: true,
            industries: true,
            sessions: {
                include: {
                    session: true,
                    feedback: true,
                }
            },
        },
    });
};

// Function to delete question
const deleteQuestion = async (id) => {
    return prisma.question.delete({
        where: { questionId: parseInt(id) }
    });
};

// Function to add user to question
const addUser = async (questionId, userId) => {
    return prisma.question.update({
        where: { questionId: parseInt(questionId) },
        data: {
            users: {
                connect: { userId: parseInt(userId) }
            }
        },
        include: { users: true }
    });
};

// Function to add industry to question
const addIndustry = async (questionId, industryData) => {
    return prisma.question.update({
        where: { questionId: parseInt(questionId) },
        data: {
            industries: { connect: { industryId: industryData.industryId },            }
        },
        include: { industries: true }
    });
};

// Function to add sessionQuestion to question
const addSessionQuestion = async (questionId, sessionQuestionData) => {
    return prisma.sessionQuestion.create({
        data: {
            session: { connect: { sessionId: sessionQuestionData.sessionId } },
            question: { connect: { questionId: parseInt(questionId) } },
            askedAt: new Date(),
            isGenerated: sessionQuestionData.isGenerated,
        },
        include: {
            session: true,
            question: true,
        }
    });
};

// Function to add feedback to Question
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
    createQuestion,
    getAllQuestions,
    getQuestionById,
    deleteQuestion,
    updateQuestion,
    addUser,
    addIndustry,
    addSessionQuestion,
    addFeedback,
};