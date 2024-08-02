const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllFeedbacks = async () => {
  return prisma.feedback.findMany();
};

const getFeedbackByID = async (id) => {
  return prisma.feedback.findUnique({ where: { feedbackId: parseInt(id) },
include: {
  sessionQuestion: true,
} });
};


const createFeedback = async (data) => {
  const { score, gptResponse, userAnswer, sessionId, sessionQuestionId } = data;

  // Validate sessionId is required
  if (!sessionId) {
      throw new Error('sessionId is required');
  }

  // Case where sessionQuestionId is provided
  if (sessionQuestionId) {
      return prisma.feedback.create({
          data: {
              score,
              gptResponse,
              userAnswer,
              sessionQuestion: {
                  connect: {
                      sessionQuestionId: sessionQuestionId
                  }
              },
              session: {
                  connect: {
                      sessionId: sessionId
                  }
              }
          },
          include: {
              sessionQuestion: true,
              session: true
          }
      });
  }

  // Case where only sessionId is provided
  return prisma.feedback.create({
      data: {
          score,
          gptResponse,
          userAnswer,
          session: {
              connect: {
                  sessionId: sessionId
              }
          }
      },
      include: {
          session: true
      }
  });
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
    where: {
      feedbackId: parseInt(id),
  },
  data: updatedData,
  include: {
      sessionQuestion: true,
  },
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