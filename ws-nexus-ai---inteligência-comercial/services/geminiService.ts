
import { GoogleGenAI, Type } from "@google/genai";

const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Configuração padrão de RH caso o usuário não defina
const DEFAULT_RH_CONFIG = {
  segment: "Inteligência Comercial",
  companyType: "Alta Performance / Inovação",
  idealProfile: "Perfil Executor, focado em metas e tecnologia",
  qualificationLevel: "Sênior"
};

export const analyzeLeadTemperature = async (score: number, interactions: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `O lead possui score ${score} e as seguintes interações: ${interactions}. Me dê uma recomendação de 1 frase para o vendedor fechar o negócio agora.`,
    config: {
      systemInstruction: "Você é o Diretor Comercial da WS Brasil I.C. Seja direto, agressivo e estratégico.",
      temperature: 0.5,
    }
  });
  return response.text || "Fechamento imediato recomendado.";
};

export const analyzeFinancialHealth = async (totalIncome: number, totalExpense: number, overdueAmount: number) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Saldo de Entradas: R$ ${totalIncome}, Saldo de Saídas: R$ ${totalExpense}, Montante Inadimplente: R$ ${overdueAmount}. Me dê um insight executivo de 1 frase sobre o lucro e risco.`,
    config: {
      systemInstruction: "Você é o CFO da WS Brasil I.C. Seja pragmático, focado em liquidez e solvência.",
      temperature: 0.7,
    }
  });
  return response.text || "Fluxo estável, monitore os recebíveis.";
};

export const analyzeCandidateScore = async (candidateData: string, customConfig = DEFAULT_RH_CONFIG) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Contexto da Vaga:
    Empresa: ${customConfig.companyType}
    Segmento: ${customConfig.segment}
    Perfil Desejado: ${customConfig.idealProfile}
    Nível: ${customConfig.qualificationLevel}

    Dados do Candidato: ${candidateData}

    Retorne um score de 0 a 100 e uma justificativa focada no ROI que este perfil trará para este contexto específico.`,
    config: {
      systemInstruction: "Você é um Especialista em Recrutamento Estratégico. Sua análise deve ser baseada rigorosamente nos parâmetros de empresa e perfil fornecidos.",
      temperature: 0.5,
    }
  });
  return response.text || "Análise indisponível.";
};

export const analyzeCandidatePDF = async (base64Pdf: string, candidateName: string, targetRole: string, customConfig = DEFAULT_RH_CONFIG) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Pdf
          }
        },
        {
          text: `Analise este currículo em PDF para o candidato ${candidateName} visando a vaga de ${targetRole}.
          
          DIRETRIZES DE RECRUTAMENTO:
          - Segmento: ${customConfig.segment}
          - Cultura da Empresa: ${customConfig.companyType}
          - Características do Candidato Ideal: ${customConfig.idealProfile}
          - Qualificação Profissional Exigida: ${customConfig.qualificationLevel}

          Extraia e avalie: 
          1. Hard Skills alinhadas ao segmento.
          2. Soft Skills detectadas pelo tom e estrutura do CV.
          3. Fit Cultural (0-100) baseado no arquétipo da empresa.
          4. Parecer Decisório: 'Contratar', 'Avaliar' ou 'Descartar'.`
        }
      ]
    },
    config: {
      systemInstruction: "Você é o Head de Talentos da WS Brasil I.C. Sua missão é garantir que o candidato seja lucrativo e culturalmente compatível com as diretrizes enviadas.",
      temperature: 0.4,
    }
  });
  return response.text || "Falha na leitura do documento.";
};

export const analyzeClimateSentiment = async (feedbacks: string[]) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Avalie o sentimento predominante nestes feedbacks: ${feedbacks.join(' | ')}.`,
    config: {
      systemInstruction: "Você é o Diretor de Cultura da WS Brasil I.C. Analise o clima de forma pragmática.",
      temperature: 0.7,
    }
  });
  return response.text || "Sentimento neutro.";
};

export const generateContract = async (prompt: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Redija um contrato formal baseado nestas informações: ${prompt}.`,
    config: {
      systemInstruction: "Você é o Diretor Jurídico da WS Brasil I.C. Use linguagem técnica e clara.",
      temperature: 0.7,
    }
  });
  return response.text || "Erro na geração da minuta.";
};

export const generateSchedulingCopy = async (clientName: string, date: string, time: string, link: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Confirme a reunião com ${clientName} no dia ${date} às ${time}. Link: ${link}.`,
    config: {
      systemInstruction: `Você é o Assistente Executivo da WS Brasil I.C. ...`,
      temperature: 0.3,
    }
  });
  return response.text || `Olá, ${clientName}! Sua reunião na WS Brasil foi confirmada para ${date} às ${time}. Link: ${link}`;
};

export const getScheduleOptimization = async (currentLoad: number) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Minha agenda está com ${currentLoad}% de ocupação esta semana. Me dê um insight estratégico de 1 frase.`,
    config: {
      systemInstruction: "Você é um Consultor de Produtividade Executiva focado em maximizar o lucro da WS Brasil.",
      temperature: 0.9,
    }
  });
  return response.text || "Continue focado na prospecção ativa.";
};

export const generateMessageCopy = async (channel: 'whatsapp' | 'email', client: string, docName: string, link: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crie uma copy de alto impacto para ${channel} enviando o documento "${docName}" para o cliente "${client}". Link de assinatura: ${link}`,
    config: {
      systemInstruction: "Você é o Diretor Comercial da WS Brasil I.C. Sua linguagem é executiva, direta e focada em fechamento rápido.",
      temperature: 0.7,
    }
  });
  return response.text || "";
};

export const generatePDI = async (name: string, position: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crie um Plano de Desenvolvimento Individual (PDI) técnico e estratégico para o colaborador ${name}, classificado na matriz 9-box como: ${position}.`,
    config: {
      systemInstruction: "Você é o Arquiteto de Talentos da WS Brasil I.C. Gere valor e crescimento acelerado.",
      temperature: 0.7,
    }
  });
  return response.text || "";
};

export const generateStockClearanceCampaign = async (stockData: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crie uma campanha de marketing para queima de estoque baseada nestes dados: ${stockData}. Foque em liquidez imediata.`,
    config: {
      systemInstruction: "Você é o Growth Hacker da WS Brasil I.C. Gere caixa rápido com automação inteligente.",
      temperature: 0.8,
    }
  });
  return response.text || "";
};
