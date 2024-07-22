const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getChatHistory = async (sessionId) => {
  return await prisma.feedback.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
};

const saveChatMessage = async (sessionId, userAnswer, gptResponse) => {
  await prisma.feedback.create({
    data: {
      sessionId,
      userAnswer,
      gptResponse,
    },
  });
};

module.exports = {
  getChatHistory,
  saveChatMessage,
};