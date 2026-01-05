
import { Organization, SubscriptionLevel } from '../types';

/**
 * Serviço de Notificações Estratégicas WS Brasil
 * Focado em Onboarding Acelerado e Retenção de Clientes
 */

const WHATSAPP_NUMBER = "5521992844353";
const APP_LINK = window.location.origin;

export const getOnboardingWhatsAppMessage = (orgName: string, plan: SubscriptionLevel, userEmail: string, pass: string) => {
  return encodeURIComponent(`Olá! Tudo bem?

É um prazer receber a ${orgName} no ecossistema da WS Brasil Inteligência Comercial! 🚀

Sua assinatura do Plano ${plan} foi confirmada e sua plataforma já está liberada para uso.

🌐 Link de Acesso: ${APP_LINK}
👤 Seu Usuário: ${userEmail}
🔑 Senha Provisória: ${pass}

Recomendamos alterar sua chave de comando no primeiro acesso para ativar a blindagem Nexus.

Caso precise de qualquer auxílio no Onboarding da sua equipe, estou à disposição neste número.

Vamos colocar sua empresa nos trilhos do sucesso! 📈`);
};

export const getOnboardingEmailTemplate = (orgName: string, plan: SubscriptionLevel, userEmail: string, pass: string) => {
  const resources = {
    BRONZE: "CRM de Vendas, Dashboard de KPIs e Nexus Chronos",
    SILVER: "CRM de Vendas, Módulo de RH, Análise de Perfil DISC e Nexus Chronos",
    GOLD: "Ecossistema Completo (CRM, RH, Financeiro, Marketing AI e Nexus Docs)"
  };

  return `Prezado(a) Comandante,

Seja bem-vindo à WS Brasil Inteligência Comercial. É uma honra ter a ${orgName} utilizando nossa tecnologia para reduzir custos e gerar mais receita através de inteligência artificial proativa.

A partir de agora, seu Node está ativo com acesso às ferramentas de: ${resources[plan]}.

Sua Chave de Acesso:
- Usuário: ${userEmail}
- Senha: ${pass}

Primeiros passos sugeridos:
1. Acesse a plataforma: ${APP_LINK}
2. Cadastre seus Colaboradores: No módulo de RH, insira sua equipe para que eles comecem a utilizar o CRM.
3. Explore seu Dashboard: Acompanhe em tempo real os indicadores de vendas e performance.

Canais de Suporte:
📞 WhatsApp: (21) 992844353
📧 E-mail: comercial@wsbrasilic.com.br

Estamos ansiosos para ver o crescimento da ${orgName} conosco.

Atenciosamente,
Diretoria WS Brasil Inteligência Comercial`;
};

/**
 * Simula o disparo de Onboarding (No backend seria um Trigger de DB)
 */
export const sendOnboardingNotification = async (org: Organization, userEmail: string, method: 'whatsapp' | 'email') => {
  const tempPass = "NEXUS" + Math.floor(1000 + Math.random() * 9000);
  
  if (method === 'whatsapp') {
    const msg = getOnboardingWhatsAppMessage(org.name, org.subscription, userEmail, tempPass);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  } else {
    const subject = encodeURIComponent(`Bem-vindo à WS Brasil! Onboarding: ${org.name}`);
    const body = encodeURIComponent(getOnboardingEmailTemplate(org.name, org.subscription, userEmail, tempPass));
    window.open(`mailto:${userEmail}?subject=${subject}&body=${body}`, '_blank');
  }
  
  return true;
};
