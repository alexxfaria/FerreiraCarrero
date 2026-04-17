const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const yearTarget = document.querySelector("#current-year");
const revealItems = document.querySelectorAll(".reveal");
const modalBackdrop = document.querySelector("[data-modal-backdrop]");
const modalContent = document.querySelector("[data-modal-content]");
const modalClose = document.querySelector("[data-modal-close]");
const modalTriggers = document.querySelectorAll("[data-modal-target]");

const chatWidget = document.querySelector("[data-chat-widget]");
const chatPanel = document.querySelector("[data-chat-panel]");
const chatToggle = document.querySelector("[data-chat-toggle]");
const chatClose = document.querySelector("[data-chat-close]");
const chatHistory = document.querySelector("[data-chat-history]");
const chatOptions = document.querySelector("[data-chat-options]");
const chatInputWrap = document.querySelector("[data-chat-input-wrap]");
const chatActions = document.querySelector("[data-chat-actions]");
const chatForm = document.querySelector("[data-chat-form]");
const chatProgress = document.querySelector("[data-chat-progress]");

let lastFocusedTrigger = null;
let typingTimeoutId = null;

const WHATSAPP_NUMBER = "5543996160070";

const triageFlows = {
  previdenciario: {
    label: "Previdenciário",
    intro:
      "Vamos fazer uma pré-análise previdenciária. Responda com atenção para montarmos um resumo útil antes do atendimento.",
    steps: [
      { id: "name", label: "Qual é o seu nome completo?", type: "text", placeholder: "Digite seu nome" },
      { id: "age", label: "Qual é a sua idade?", type: "number", placeholder: "Ex.: 61" },
      {
        id: "goal",
        label: "Qual é o seu principal objetivo?",
        type: "choice",
        options: [
          "Aposentadoria por idade",
          "Aposentadoria por tempo de contribuição",
          "Aposentadoria especial",
          "Auxílio-doença ou incapacidade",
          "BPC/LOAS",
          "Revisão de benefício",
          "Outro assunto previdenciário",
        ],
      },
      {
        id: "currentContribution",
        label: "Você contribui atualmente para o INSS?",
        type: "choice",
        options: ["Sim", "Não", "Não sei informar"],
      },
      {
        id: "pastContribution",
        label: "Você já contribuiu anteriormente?",
        type: "choice",
        options: ["Sim", "Não", "Não sei informar"],
      },
      {
        id: "workType",
        label: "Qual tipo de atividade você exerce ou exerceu?",
        type: "choice",
        options: ["Urbana", "Rural", "Atividade especial/insalubre", "Mista", "Não se aplica"],
      },
      {
        id: "benefitStatus",
        label: "Você já recebe algum benefício previdenciário?",
        type: "choice",
        options: ["Não", "Sim", "Pedido em andamento"],
      },
      {
        id: "details",
        label: "Se quiser, descreva rapidamente algum detalhe importante do seu caso.",
        type: "textarea",
        placeholder: "Ex.: tempo de contribuição aproximado, benefício negado, atividade especial, período rural...",
        optional: true,
      },
    ],
    summary(answers) {
      return [
        `Nome: ${answers.name}`,
        `Área: Previdenciário`,
        `Idade: ${answers.age} anos`,
        `Objetivo principal: ${answers.goal}`,
        `Contribui atualmente para o INSS: ${answers.currentContribution}`,
        `Já contribuiu antes: ${answers.pastContribution}`,
        `Tipo de atividade: ${answers.workType}`,
        `Situação de benefício: ${answers.benefitStatus}`,
        answers.details ? `Detalhes informados: ${answers.details}` : "",
      ].filter(Boolean);
    },
  },
  trabalhista: {
    label: "Trabalhista",
    intro:
      "Vamos registrar os pontos principais da questão trabalhista para o escritório já receber a demanda filtrada.",
    steps: [
      { id: "name", label: "Qual é o seu nome completo?", type: "text", placeholder: "Digite seu nome" },
      {
        id: "profile",
        label: "Você busca atendimento como empregado ou empresa?",
        type: "choice",
        options: ["Empregado", "Empresa", "Outro"],
      },
      {
        id: "employmentStatus",
        label: "O vínculo de trabalho está ativo ou já foi encerrado?",
        type: "choice",
        options: ["Ativo", "Encerrado", "Não se aplica"],
      },
      {
        id: "issue",
        label: "Qual é o principal problema?",
        type: "choice",
        options: [
          "Verbas rescisórias",
          "Horas extras",
          "Reconhecimento de vínculo",
          "Assédio",
          "Justa causa",
          "Consultivo empresarial",
          "Outro assunto trabalhista",
        ],
      },
      {
        id: "documents",
        label: "Você tem documentos ou provas disponíveis?",
        type: "choice",
        options: ["Sim", "Não", "Parcialmente"],
      },
      {
        id: "details",
        label: "Descreva rapidamente o caso.",
        type: "textarea",
        placeholder: "Ex.: data da saída, empresa, valores pendentes, principal dúvida...",
      },
    ],
    summary(answers) {
      return [
        `Nome: ${answers.name}`,
        `Área: Trabalhista`,
        `Perfil do atendimento: ${answers.profile}`,
        `Status do vínculo: ${answers.employmentStatus}`,
        `Principal problema: ${answers.issue}`,
        `Possui documentos/provas: ${answers.documents}`,
        `Resumo do caso: ${answers.details}`,
      ];
    },
  },
  familia: {
    label: "Família",
    intro:
      "Vamos organizar as informações essenciais do caso familiar para agilizar o primeiro atendimento.",
    steps: [
      { id: "name", label: "Qual é o seu nome completo?", type: "text", placeholder: "Digite seu nome" },
      {
        id: "topic",
        label: "Qual é o tema principal do seu caso?",
        type: "choice",
        options: ["Divórcio", "Guarda", "Pensão alimentícia", "Inventário", "União estável", "Outro assunto de família"],
      },
      {
        id: "urgency",
        label: "Existe alguma urgência no caso?",
        type: "choice",
        options: ["Sim", "Não", "Ainda não sei"],
      },
      {
        id: "agreement",
        label: "Há possibilidade de acordo entre as partes?",
        type: "choice",
        options: ["Sim", "Não", "Talvez"],
      },
      {
        id: "children",
        label: "Há filhos menores envolvidos?",
        type: "choice",
        options: ["Sim", "Não", "Não se aplica"],
      },
      {
        id: "details",
        label: "Descreva brevemente a situação.",
        type: "textarea",
        placeholder: "Ex.: separação recente, disputa de guarda, atraso de pensão, necessidade de inventário...",
      },
    ],
    summary(answers) {
      return [
        `Nome: ${answers.name}`,
        `Área: Família`,
        `Tema principal: ${answers.topic}`,
        `Há urgência: ${answers.urgency}`,
        `Possibilidade de acordo: ${answers.agreement}`,
        `Filhos menores envolvidos: ${answers.children}`,
        `Resumo do caso: ${answers.details}`,
      ];
    },
  },
  civil: {
    label: "Cível",
    intro:
      "Vamos levantar as informações principais do caso cível antes de encaminhar para o atendimento.",
    steps: [
      { id: "name", label: "Qual é o seu nome completo?", type: "text", placeholder: "Digite seu nome" },
      {
        id: "topic",
        label: "Qual é o assunto principal?",
        type: "choice",
        options: ["Cobrança", "Contrato", "Indenização", "Responsabilidade civil", "Obrigação de fazer", "Outro assunto cível"],
      },
      {
        id: "otherParty",
        label: "A outra parte é pessoa física, empresa ou órgão público?",
        type: "choice",
        options: ["Pessoa física", "Empresa", "Órgão público", "Não sei informar"],
      },
      {
        id: "documents",
        label: "Você possui contrato, comprovantes ou outros documentos?",
        type: "choice",
        options: ["Sim", "Não", "Parcialmente"],
      },
      {
        id: "details",
        label: "Descreva o caso resumidamente.",
        type: "textarea",
        placeholder: "Ex.: cobrança indevida, descumprimento contratual, dano moral, reparação de prejuízo...",
      },
    ],
    summary(answers) {
      return [
        `Nome: ${answers.name}`,
        `Área: Cível`,
        `Assunto principal: ${answers.topic}`,
        `Outra parte envolvida: ${answers.otherParty}`,
        `Possui documentos: ${answers.documents}`,
        `Resumo do caso: ${answers.details}`,
      ];
    },
  },
  empresarial: {
    label: "Empresarial",
    intro:
      "Vamos fazer uma triagem inicial empresarial para que o escritório receba a demanda já contextualizada.",
    steps: [
      { id: "name", label: "Qual é o seu nome completo?", type: "text", placeholder: "Digite seu nome" },
      { id: "company", label: "Qual é o nome da empresa?", type: "text", placeholder: "Nome da empresa" },
      {
        id: "topic",
        label: "Qual é o foco principal da demanda?",
        type: "choice",
        options: ["Contrato", "Cobrança", "Societário", "Consultivo preventivo", "Trabalhista empresarial", "Outro assunto empresarial"],
      },
      {
        id: "urgency",
        label: "Há prazo ou urgência relevante?",
        type: "choice",
        options: ["Sim", "Não", "Não sei informar"],
      },
      {
        id: "documents",
        label: "Você já possui contratos, notificações ou documentos da demanda?",
        type: "choice",
        options: ["Sim", "Não", "Parcialmente"],
      },
      {
        id: "details",
        label: "Descreva a necessidade principal.",
        type: "textarea",
        placeholder: "Ex.: revisão contratual, cobrança, disputa societária, prevenção de passivo...",
      },
    ],
    summary(answers) {
      return [
        `Nome: ${answers.name}`,
        `Área: Empresarial`,
        `Empresa: ${answers.company}`,
        `Demanda principal: ${answers.topic}`,
        `Há urgência/prazo: ${answers.urgency}`,
        `Possui documentos: ${answers.documents}`,
        `Resumo do caso: ${answers.details}`,
      ];
    },
  },
  penal: {
    label: "Penal",
    intro:
      "Vamos levantar apenas os pontos essenciais para que a equipe avalie a urgência e o contexto do caso penal.",
    steps: [
      { id: "name", label: "Qual é o seu nome completo?", type: "text", placeholder: "Digite seu nome" },
      {
        id: "situation",
        label: "Qual é a situação principal?",
        type: "choice",
        options: ["Inquérito policial", "Processo criminal", "Audiência marcada", "Flagrante/prisão", "Tribunal do Júri", "Outro assunto penal"],
      },
      {
        id: "urgency",
        label: "Existe urgência imediata?",
        type: "choice",
        options: ["Sim", "Não", "Talvez"],
      },
      {
        id: "involvement",
        label: "Você busca atendimento para si ou para terceiro?",
        type: "choice",
        options: ["Para mim", "Para terceiro", "Não se aplica"],
      },
      {
        id: "details",
        label: "Descreva resumidamente o caso ou a fase atual.",
        type: "textarea",
        placeholder: "Ex.: intimação recebida, audiência próxima, prisão recente, defesa em andamento...",
      },
    ],
    summary(answers) {
      return [
        `Nome: ${answers.name}`,
        `Área: Penal`,
        `Situação principal: ${answers.situation}`,
        `Urgência imediata: ${answers.urgency}`,
        `Atendimento para: ${answers.involvement}`,
        `Resumo do caso: ${answers.details}`,
      ];
    },
  },
  administrativo: {
    label: "Administrativo",
    intro:
      "Vamos registrar os dados principais da demanda administrativa antes do encaminhamento ao atendimento.",
    steps: [
      { id: "name", label: "Qual é o seu nome completo?", type: "text", placeholder: "Digite seu nome" },
      {
        id: "topic",
        label: "Qual é o tema principal?",
        type: "choice",
        options: ["Licitação", "Processo administrativo", "Servidor público", "Sanção administrativa", "Órgão público", "Outro assunto administrativo"],
      },
      {
        id: "stage",
        label: "Em que fase o caso está?",
        type: "choice",
        options: ["Preventiva/consultiva", "Notificação recebida", "Processo em andamento", "Recurso", "Não sei informar"],
      },
      {
        id: "deadline",
        label: "Existe prazo em andamento?",
        type: "choice",
        options: ["Sim", "Não", "Não sei informar"],
      },
      {
        id: "details",
        label: "Descreva resumidamente a situação.",
        type: "textarea",
        placeholder: "Ex.: defesa administrativa, impugnação, licitação, sindicância, recurso...",
      },
    ],
    summary(answers) {
      return [
        `Nome: ${answers.name}`,
        `Área: Administrativo`,
        `Tema principal: ${answers.topic}`,
        `Fase do caso: ${answers.stage}`,
        `Existe prazo: ${answers.deadline}`,
        `Resumo do caso: ${answers.details}`,
      ];
    },
  },
};

const chatState = {
  isOpen: false,
  selectedArea: "",
  answers: {},
  stepIndex: 0,
  completed: false,
};

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open", !expanded);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}

const closeModal = () => {
  if (!modalBackdrop || !modalContent) {
    return;
  }

  modalBackdrop.hidden = true;
  modalContent.innerHTML = "";
  document.body.classList.remove("modal-open");

  if (lastFocusedTrigger) {
    lastFocusedTrigger.focus();
    lastFocusedTrigger = null;
  }
};

if (modalBackdrop && modalContent && modalClose) {
  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const templateId = trigger.getAttribute("data-modal-target");
      const template = templateId ? document.getElementById(templateId) : null;

      if (!(template instanceof HTMLTemplateElement)) {
        return;
      }

      lastFocusedTrigger = trigger;
      modalContent.innerHTML = "";
      modalContent.append(template.content.cloneNode(true));
      modalBackdrop.hidden = false;
      document.body.classList.add("modal-open");
      modalClose.focus();
    });
  });

  modalClose.addEventListener("click", closeModal);

  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalBackdrop.hidden) {
      closeModal();
    }
  });
}

function addBubble(text, role = "assistant", extraClass = "") {
  if (!chatHistory) {
    return;
  }

  const bubble = document.createElement("article");
  bubble.className = `chat-bubble ${role} ${extraClass}`.trim();

  if (Array.isArray(text)) {
    const intro = document.createElement("p");
    intro.textContent = "Resumo da triagem:";
    bubble.append(intro);

    const list = document.createElement("ul");
    text.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });
    bubble.append(list);
  } else {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    bubble.append(paragraph);
  }

  chatHistory.append(bubble);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function removeTypingBubble() {
  if (!chatHistory) {
    return;
  }

  const typingBubble = chatHistory.querySelector("[data-chat-typing]");
  if (typingBubble) {
    typingBubble.remove();
  }
}

function showTypingBubble() {
  if (!chatHistory) {
    return;
  }

  removeTypingBubble();

  const bubble = document.createElement("article");
  bubble.className = "chat-bubble assistant typing";
  bubble.setAttribute("data-chat-typing", "true");
  bubble.innerHTML =
    '<div class="chat-typing" aria-label="Digitando"><span></span><span></span><span></span></div>';

  chatHistory.append(bubble);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function addAssistantBubble(text, callback) {
  removeTypingBubble();

  if (typingTimeoutId) {
    clearTimeout(typingTimeoutId);
  }

  showTypingBubble();

  typingTimeoutId = window.setTimeout(() => {
    removeTypingBubble();
    addBubble(text, "assistant");
    if (typeof callback === "function") {
      callback();
    }
  }, 650);
}

function clearComposer() {
  if (chatOptions) chatOptions.innerHTML = "";
  if (chatInputWrap) chatInputWrap.innerHTML = "";
  if (chatActions) chatActions.innerHTML = "";
}

function setProgress(current, total) {
  if (!chatProgress) {
    return;
  }

  const value = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  chatProgress.style.width = `${value}%`;
}

function startAreaSelection() {
  clearComposer();
  setProgress(0, 1);

  addAssistantBubble("Olá. Vamos fazer uma triagem rápida para encaminhar seu atendimento com um resumo pronto.", () => {
    addAssistantBubble("Escolha a área principal do seu caso.", () => {
      Object.entries(triageFlows).forEach(([key, flow]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chat-choice";
        button.textContent = flow.label;
        button.addEventListener("click", () => {
          chatState.selectedArea = key;
          chatState.answers = {};
          chatState.stepIndex = 0;
          chatState.completed = false;
          addBubble(flow.label, "user");
          addAssistantBubble(flow.intro, () => {
            renderCurrentStep();
          });
        });
        chatOptions.append(button);
      });
    });
  });

  const directButton = document.createElement("button");
  directButton.type = "button";
  directButton.className = "chat-secondary";
  directButton.textContent = "Falar direto no WhatsApp";
  directButton.addEventListener("click", () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank", "noopener,noreferrer");
  });
  chatActions.append(directButton);
}

function getCurrentFlow() {
  return triageFlows[chatState.selectedArea];
}

function getCurrentStep() {
  const flow = getCurrentFlow();
  return flow ? flow.steps[chatState.stepIndex] : null;
}

function normalizeAnswer(value) {
  return typeof value === "string" ? value.trim() : value;
}

function validateStep(step, value) {
  const normalized = normalizeAnswer(value);

  if (step.optional && (normalized === "" || normalized == null)) {
    return true;
  }

  if (step.type === "number") {
    return normalized !== "" && /^\d+$/.test(normalized);
  }

  return normalized !== "";
}

function renderCurrentStep() {
  const flow = getCurrentFlow();
  const step = getCurrentStep();

  if (!flow || !step) {
    finishTriage();
    return;
  }

  clearComposer();
  setProgress(chatState.stepIndex, flow.steps.length);
  addAssistantBubble(step.label, () => {
    if (step.type === "choice") {
      step.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chat-option";
        button.textContent = option;
        button.addEventListener("click", () => {
          chatState.answers[step.id] = option;
          addBubble(option, "user");
          chatState.stepIndex += 1;
          renderCurrentStep();
        });
        chatOptions.append(button);
      });
    } else {
      const label = document.createElement("label");
      label.textContent = step.optional ? "Resposta opcional" : "Sua resposta";

      const input =
        step.type === "textarea" ? document.createElement("textarea") : document.createElement("input");
      input.className = step.type === "textarea" ? "chat-textarea" : "chat-input";
      input.placeholder = step.placeholder || "";

      if (step.type !== "textarea") {
        input.type = step.type === "number" ? "tel" : "text";
        if (step.type === "number") {
          input.inputMode = "numeric";
        }
      }

      chatInputWrap.append(label, input);

      const helper = document.createElement("span");
      helper.className = "chat-helper";
      helper.textContent = step.optional
        ? "Você pode pular esta etapa se preferir."
        : "Essas informações ajudam a equipe a priorizar e organizar o atendimento.";
      chatInputWrap.append(helper);

      const submit = document.createElement("button");
      submit.type = "submit";
      submit.className = "chat-primary";
      submit.textContent = step.optional ? "Continuar" : "Avançar";
      chatActions.append(submit);

      if (step.optional) {
        const skip = document.createElement("button");
        skip.type = "button";
        skip.className = "chat-secondary";
        skip.textContent = "Pular";
        skip.addEventListener("click", () => {
          chatState.answers[step.id] = "";
          chatState.stepIndex += 1;
          renderCurrentStep();
        });
        chatActions.append(skip);
      }

      input.focus();
    }
  });
}

function buildWhatsAppMessage() {
  const flow = getCurrentFlow();
  if (!flow) {
    return "";
  }

  const lines = flow.summary(chatState.answers);
  return [
    "Olá. Preenchi a triagem inicial do site e gostaria de atendimento.",
    "",
    ...lines,
    "",
    "Gostaria de agendar uma análise inicial.",
  ].join("\n");
}

function finishTriage() {
  const flow = getCurrentFlow();
  if (!flow || chatState.completed) {
    return;
  }

  chatState.completed = true;
  clearComposer();
  setProgress(flow.steps.length, flow.steps.length);

  const summaryLines = flow.summary(chatState.answers);
  addBubble(summaryLines, "assistant", "summary");

  const sendButton = document.createElement("button");
  sendButton.type = "button";
  sendButton.className = "chat-primary";
  sendButton.textContent = "Enviar resumo no WhatsApp";
  sendButton.addEventListener("click", () => {
    const text = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
  });

  const restartButton = document.createElement("button");
  restartButton.type = "button";
  restartButton.className = "chat-secondary";
  restartButton.textContent = "Refazer triagem";
  restartButton.addEventListener("click", resetChat);

  chatActions.append(sendButton, restartButton);
}

function handleFormSubmit(event) {
  event.preventDefault();

  const step = getCurrentStep();
  if (!step || step.type === "choice") {
    return;
  }

  const field = chatInputWrap.querySelector("input, textarea");
  if (!field) {
    return;
  }

  const value = normalizeAnswer(field.value);
  if (!validateStep(step, value)) {
    field.focus();
    field.reportValidity?.();
    return;
  }

  chatState.answers[step.id] = value;
  addBubble(value || "Etapa pulada", "user");
  chatState.stepIndex += 1;
  renderCurrentStep();
}

function resetChat() {
  chatState.selectedArea = "";
  chatState.answers = {};
  chatState.stepIndex = 0;
  chatState.completed = false;

  if (chatHistory) {
    chatHistory.innerHTML = "";
  }

  removeTypingBubble();

  startAreaSelection();
}

function openChat() {
  if (!chatPanel || !chatToggle) {
    return;
  }

  chatPanel.hidden = false;
  chatState.isOpen = true;
  chatToggle.setAttribute("aria-expanded", "true");

  if (!chatState.selectedArea && chatHistory && chatHistory.childElementCount === 0) {
    resetChat();
  }
}

function closeChat() {
  if (!chatPanel || !chatToggle) {
    return;
  }

  chatPanel.hidden = true;
  chatState.isOpen = false;
  chatToggle.setAttribute("aria-expanded", "false");
}

if (chatToggle && chatPanel && chatClose && chatForm) {
  chatToggle.addEventListener("click", () => {
    if (chatState.isOpen) {
      closeChat();
    } else {
      openChat();
    }
  });

  chatClose.addEventListener("click", closeChat);
  chatForm.addEventListener("submit", handleFormSubmit);
  closeChat();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  }
);

revealItems.forEach((item) => observer.observe(item));
