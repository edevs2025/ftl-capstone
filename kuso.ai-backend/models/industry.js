const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createIndustry = async (data) => {
    return prisma.industry.create({
        data: {
            industryName: data.industryName,
            users: data.users ? { connect: data.users.map(id => ({ userId: id })) } : undefined,
            questions: data.questions ? { connect: data.questions.map(id => ({ questionId: id })) } : undefined,
        },
        include: {
            users: true,
            questions: true,
        }
    });
};

const getAllIndustries = async (filters) => {    
    let where = {}

    if(filters.industryName){
        where.industryName =  { contains: filters.industryName };
    }
    return prisma.industry.findMany({
        where: Object.keys(where).length ? where : undefined,
        include: {
            users: true,
            questions: true,
        },
    });
};

const updateIndustry = async (id, industryData) => {
    const existingData = await prisma.industry.findUnique({
        where: { industryId: parseInt(id) },
    });

    if (!existingData) {
        throw new Error('User not found');
    }

    const updatedData = {
        ...existingData,
        ...industryData,
    };
    return prisma.industry.update({
        where: { industryId: parseInt(id) },
        data: updatedData,
        // {
        //     industryName: industryData.industryName,
        //     users: industryData.users ? {
        //         set: industryData.users.map(id => ({ userId: id }))
        //     } : undefined,
        //     questions: industryData.questions ? {
        //         set: industryData.questions.map(id => ({ questionId: id }))
        //     } : undefined,
        // },
        include: {
            users: true,
            questions: true,
        },
    });
};

const getIndustryById = async (id) => {
    return prisma.industry.findUnique({
        where: { industryId: parseInt(id) },
        include: {
            users: true,
            questions: true,
        },
    });
};

const deleteIndustry = async (id) => {
    return prisma.industry.delete({
        where: { industryId: parseInt(id) }
    });
};

const addUser = async (industryId, userId) => {
    return prisma.industry.update({
        where: { industryId: parseInt(industryId) },
        data: {
            users: {
                connect: { userId: parseInt(userId) }
            }
        },
        include: { users: true }
    });
};

const addQuestion = async (industryId, questionData) => {
    return prisma.industry.update({
        where: { industryId: parseInt(industryId) },
        data: {
            questions: {
                connectOrCreate: {
                    where: { questionId: questionData.questionId },
                    create: { 
                        questionContent: questionData.questionContent,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            }
        },
        include: { questions: true }
    });
};

module.exports = {
    createIndustry,
    getAllIndustries,
    getIndustryById,
    deleteIndustry,
    updateIndustry,
    addUser,
    addQuestion,
}