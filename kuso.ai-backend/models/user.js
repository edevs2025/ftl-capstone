const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Function to create a user
const createUser = async (data) => {
    return prisma.user.create({
        data: {
            username: data.username,
            name: data.name,
            email: data.email,
            password: data.password,
            age: data.age,
            employed: data.employed,
            industries: data.industries ? { connect: data.industries.map(id => ({ industryId: id })) } : undefined,
            questions: data.questions ? { connect: data.questions.map(id => ({ questionId: id })) } : undefined,
            sessions: data.sessions ? { connect: data.sessions.map(id => ({ sessionId: id })) } : undefined,
        },
        include: {
            industries: true,
            questions: true,
            sessions: true,
        }
    });
};

// Function to get all users
const getAllUsers = async (filters) => {
    let where = {};

    if (filters.userId) {
        where.userId = parseInt(filters.userId);
    }
    
    return prisma.user.findMany({
        where: Object.keys(where).length ? where : undefined,
        include: {
            industries: true,
            questions: true,
            sessions: true,
        }
    });
};

// Function to update user
const updateUser = async (id, userData) => {
    return prisma.user.update({
        where: { userId: parseInt(id) },
        data: userData,
        include: {
            industries: true,
            questions: true,
            sessions: true,
        }
    });
};

// Function to get user by id
const getUserById = async (id) => {
    return prisma.user.findUnique({
        where: { userId: parseInt(id) },
        include: {
            industries: true,
            questions: true,
            sessions: true,
        }
    });
};

const addIndustry = async (userId, industryData) => {
    return prisma.user.update({
        where: { userId: parseInt(userId) },
        data: {
            industries: {
                connectOrCreate: {
                    where: { industryName: industryData.industryName },
                    create: { industryName: industryData.industryName }
                }
            }
        },
        include: { industries: true }
    });
};

const addQuestion = async (userId, questionData) => {
    return prisma.user.update({
        where: { userId: parseInt(userId) },
        data: {
            questions: {
                connectOrCreate: {
                    where: { questionId: questionData.questionId },
                    create: { questionContent: questionData.questionContent }
                }
            }
        },
        include: { questions: true }
    });
};

const addSession = async (userId, sessionData) => {
    return prisma.session.create({
        data: {
            user: { connect: { userId: parseInt(userId) } },
            questions: {
                create: sessionData.questions.map(q => ({
                    question: { connect: { questionId: q.questionId } },
                    askedAt: new Date(),
                    isGenerated: q.isGenerated || false,
                }))
            },
            feedback: {
                create: sessionData.feedback.map(f => ({
                    score: f.score,
                    gptResponse: f.gptResponse,
                    userAnswer: f.userAnswer,
                    question: { connect: { questionId: f.questionId } }
                }))
            }
        },
        include: {
            user: true,
            questions: {
                include: {
                    question: true
                }
            },
            feedback: true
        }
    });
};

// Function to delete user
const deleteUser = async (id) => {
    return prisma.user.delete({
        where: { userId: parseInt(id) }
    });
};

const removeIndustry = async (userId, industryId) => {
    return prisma.user.update({
        where: { userId: parseInt(userId) },
        data: {
            industries: {
                disconnect: { industryId: parseInt(industryId) }
            }
        },
        include: { industries: true }
    });
};

const removeQuestion = async (userId, questionId) => {
    return prisma.user.update({
        where: { userId: parseInt(userId) },
        data: {
            questions: {
                disconnect: { questionId: parseInt(questionId) }
            }
        },
        include: { questions: true }
    });
};



module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    deleteUser,
    updateUser,
    addIndustry,
    addQuestion,
    addSession,
    removeIndustry,
    removeQuestion,
};