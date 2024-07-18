const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllFeedbacks = async () => {
  return prisma.feedback.findMany();
};

const getFeedbackByID = async (id) => {
  return prisma.feedback.findUnique({ where: { feedbackId: parseInt(id) } });
};

const createFeedback = async (feedbackData) => {
  return prisma.feedback.create({ data: feedbackData });
};

const updateFeedback = async (id, feedbackData) => {
  const existingData = await prisma.feedback.findUnique({
    where: { feedbackId: parseInt(id) },
});

if (!existingData) {
    throw new Error('User not found');
}

const updatedData = {
    ...existingData,
    ...feedbackData,
};
  return prisma.feedback.update({
    where: { feedbackId: parseInt(id) },
    data: updatedData,
  });
};

const deleteFeedback = async (id) => {
  return prisma.feedback.delete({ where: { feedbackId: parseInt(id) } });
};

module.exports = {
  getAllFeedbacks,
  getFeedbackByID,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};