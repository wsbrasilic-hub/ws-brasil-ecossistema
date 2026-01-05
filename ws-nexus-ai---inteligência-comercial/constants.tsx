
export const STRATEGY = {
  NAME: "WS Nexus AI",
  TAGLINE: "O Ecossistema Definitivo de Inteligência Comercial",
  DESCRIPTION: "Posicionamento de mercado focado na WS Brasil I.C. como cérebro operacional, reduzindo atrito e maximizando o Lucro Real através de automação proativa.",
  HIGH_IMPACT_STRATEGY: "Diferente de CRMs passivos, o Nexus utiliza a Gemini API para antecipar quedas de faturamento e sugerir correções de rota em tempo real."
};

export const SCHEMA_DADOS_JSON = {
  "lead": {
    "id": "uuid",
    "status": "enum[cold, warm, hot, closed]",
    "score_ai": "number(0-100)",
    "conversion_prob": "float",
    "interactions": "array[obj]",
    "next_best_action": "string"
  },
  "deal": {
    "id": "uuid",
    "lead_id": "uuid",
    "value": "decimal",
    "commission": "decimal",
    "contract_id": "uuid",
    "nfe_status": "enum[draft, issued, canceled]"
  },
  "inventory": {
    "sku": "string",
    "stock_current": "int",
    "stock_min": "int",
    "demand_forecast_30d": "int",
    "ai_restock_suggestion": "boolean"
  },
  "financial": {
    "revenue_bruto": "decimal",
    "taxes": "decimal",
    "operational_costs": "decimal",
    "profit_real": "decimal"
  }
};
