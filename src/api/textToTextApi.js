import api from "./axiosInstance";

export const generateText = async (memoryId, prompt) => {
  const response = await api.post("/ai/text2text/generate", {
    memoryId,
    prompt
  });
  return response.data;
};