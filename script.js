document.addEventListener('DOMContentLoaded', function() {
  // Inicializações
  setupTrimester();
  setupQuantityInputs();
  setupPhoneFormatting();
  initCaptcha();
  verificarConsentimentoCookies();

  // Event listeners
  const btnEnviar = document.getElementById('btn-enviar');
  if (btnEnviar) {
    btnEnviar.addEventListener('click', generateAndSharePDF);
  }

  const btnVerificarCaptcha = document.getElementById('btn-verificar-captcha');
  if (btnVerificarCaptcha) {
    btnVerificarCaptcha.addEventListener('click', verificarCaptcha);
  }

  const btnAceitarCookies = document.getElementById('btn-aceitar-cookies');
  if (btnAceitarCookies) {
    btnAceitarCookies.addEventListener('click', aceitarCookies);
  }

  const btnRejeitarCookies = document.getElementById('btn-rejeitar-cookies');
  if (btnRejeitarCookies) {
    btnRejeitarCookies.addEventListener('click', rejeitarCookies);
  }
});

// Variáveis globais
let captchaVerificado = false;
let currentCaptchaCode = '';

// Funções de inicialização
function setupTrimester() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const trimester = ["1º", "2º", "3º", "4º"][Math.floor(month / 3)];
  const trimesterElement = document.getElementById('trimester');

  if (trimesterElement) {
    trimesterElement.textContent = `${trimester} TRIMESTRE ${year}`;
  }
}

function setupQuantityInputs() {
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('input', calculateSubtotals);
    input.addEventListener('focus', function() {
      this.style.backgroundColor = '#f0f7ff';
    });
    input.addEventListener('blur', function() {
      this.style.backgroundColor = '';
    });
  });
}

function setupPhoneFormatting() {
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 11) {
        if (value.length > 2) {
          value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        }
        if (value.length > 10) {
          value = `${value.substring(0, 10)}-${value.substring(10)}`;
        }
        e.target.value = value;
      }
    });
  }
}

// Funções do CAPTCHA
function initCaptcha() {
  const robotCheckbox = document.getElementById('not-robot-checkbox');
  const verifyBtn = document.getElementById('btn-verify');
  const errorMsg = document.getElementById('captcha-error');

  if (robotCheckbox) {
    robotCheckbox.addEventListener('change', function() {
      if (verifyBtn) verifyBtn.disabled = !this.checked;
      if (errorMsg) errorMsg.textContent = '';
    });
  }

  if (verifyBtn) {
    verifyBtn.addEventListener('click', verificarCaptcha);
  }
}

function verificarCaptcha() {
  const checkbox = document.getElementById('not-robot-checkbox');
  const errorEl = document.getElementById('captcha-error');
  const captchaModal = document.getElementById('captcha-modal');

  if (!checkbox || !checkbox.checked) {
    if (errorEl) errorEl.textContent = 'Por favor, marque "Não sou um robô" para continuar.';
    return false;
  }

  // CAPTCHA verificado com sucesso
  captchaVerificado = true;
  if (captchaModal) captchaModal.style.display = 'none';

  if (typeof window.onCaptchaSuccess === 'function') {
    window.onCaptchaSuccess();
  }

  return true;
}

function showCaptcha() {
  const captchaModal = document.getElementById('captcha-modal');
  const robotCheckbox = document.getElementById('not-robot-checkbox');
  const errorMsg = document.getElementById('captcha-error');
  const verifyBtn = document.getElementById('btn-verify');

  if (captchaModal) captchaModal.style.display = 'flex';
  if (robotCheckbox) robotCheckbox.checked = false;
  if (errorMsg) errorMsg.textContent = '';
  if (verifyBtn) verifyBtn.disabled = true;
}

function isCaptchaVerified() {
  return captchaVerificado;
}

function resetCaptcha() {
  captchaVerificado = false;
  const robotCheckbox = document.getElementById('not-robot-checkbox');
  if (robotCheckbox) robotCheckbox.checked = false;
}

// Funções de cookies
function verificarConsentimentoCookies() {
  const consentimento = localStorage.getItem("cookieConsent");
  const cookieBanner = document.getElementById("cookie-banner");

  if (!consentimento && cookieBanner) {
    cookieBanner.style.display = "block";
  }
}

function aceitarCookies() {
  localStorage.setItem("cookieConsent", "aceito");
  const cookieBanner = document.getElementById("cookie-banner");
  if (cookieBanner) cookieBanner.style.display = "none";
}

function rejeitarCookies() {
  localStorage.setItem("cookieConsent", "rejeitado");
  const cookieBanner = document.getElementById("cookie-banner");
  if (cookieBanner) cookieBanner.style.display = "none";
}

// Funções de cálculo e formatação
function calculateSubtotals() {
  let grandTotal = 0;

  document.querySelectorAll('tbody tr').forEach(row => {
    if (row.querySelector('.category-header') || row.querySelector('td[colspan="5"]')) return;

    let rowTotal = 0;
    const inputs = row.querySelectorAll('.qty-input');

    inputs.forEach(input => {
      const quantity = parseInt(input.value) || 0;
      const price = parseFloat(input.dataset.price) || 0;
      rowTotal += quantity * price;
    });

    const subtotalCell = row.querySelector('.subtotal');
    if (subtotalCell) {
      subtotalCell.textContent = formatCurrency(rowTotal);
      subtotalCell.style.transition = 'background-color 0.3s';
      subtotalCell.style.backgroundColor = '#f0f7ff';
      setTimeout(() => subtotalCell.style.backgroundColor = '', 500);
      grandTotal += rowTotal;
    }
  });

  const totalElement = document.getElementById('total');
  if (totalElement) {
    totalElement.textContent = formatCurrency(grandTotal);
    totalElement.style.transition = 'background-color 0.3s';
    totalElement.style.backgroundColor = '#f0f7ff';
    setTimeout(() => totalElement.style.backgroundColor = '', 500);
  }

  return grandTotal;
}

function formatCurrency(value) {
  return 'R$ ' + value.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, '$1.');
}

// Funções de UI
function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'rgba(48, 90, 163, 0.9)';
  toast.style.color = 'white';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '4px';
  toast.style.zIndex = '1000';
  toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function toggleLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.toggle('visible', show);
  }
}

// Função principal para gerar e compartilhar PDF
/**
 * Função completa para gerenciamento de pedidos
 * @param {string} action - 'save', 'pdf' ou 'all' (salvar, gerar PDF ou ambos)
 * @param {boolean} [share=true] - Se true, compartilha via WhatsApp após gerar PDF
 */
async function gerenciarPedido(action = 'all', share = true) {
  try {
    // 1. Validação inicial
    if (!['save', 'pdf', 'all'].includes(action)) {
      throw new Error('Ação inválida. Use "save", "pdf" ou "all"');
    }

    // 2. Coletar dados do formulário
    const formData = coletarDadosFormulario();
    
    // 3. Executar ações conforme solicitado
    if (action === 'save' || action === 'all') {
      salvarPedidoLocal(formData);
    }

    if (action === 'pdf' || action === 'all') {
      await gerarECompartilharPDF(formData, share);
    }

  } catch (error) {
    console.error('Erro no gerenciamento de pedido:', error);
    showToast(`Erro: ${error.message}`, 'error');
  }
}

// Funções auxiliares
function coletarDadosFormulario() {
  const itens = [];
  document.querySelectorAll("tbody tr").forEach(tr => {
    const inputs = tr.querySelectorAll("input");
    if (inputs.length > 0) {
      itens.push({
        material: tr.children[1]?.innerText.trim(),
        aluno: inputs[0]?.value || 0,
        professor: inputs[1]?.value || 0,
        kit: inputs[2]?.value || 0,
      });
    }
  });

  return {
    grupo: document.getElementById('group').value,
    congregacao: document.getElementById('congregation').value,
    coordenador: document.getElementById('coordinator').value,
    telefone: document.getElementById('phone').value,
    itens,
    data: new Date().toISOString(),
    total: calcularTotal(itens)
  };
}

function salvarPedidoLocal(dados) {
  const pedidosAntigos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  pedidosAntigos.push(dados);
  localStorage.setItem("pedidos", JSON.stringify(pedidosAntigos));
  showToast('Pedido salvo localmente!', 'success');
}

async function gerarECompartilharPDF(dados, share = true) {
  // Esconder elementos não imprimíveis
  document.querySelectorAll('.no-print').forEach(btn => btn.style.display = 'none');

  // Verificar se há itens no pedido
  if (dados.total <= 0) {
    showToast('Adicione pelo menos um item ao pedido!', 'warning');
    document.querySelectorAll('.no-print').forEach(btn => btn.style.display = '');
    return;
  }

  toggleLoading(true);

  try {
    // Configuração do PDF
    const now = new Date();
    const trimester = ["1º", "2º", "3º", "4º"][Math.floor(now.getMonth() / 3)];
    const opt = {
      margin: 0,
      filename: `Pedido_Revistas_${trimester}_Trimestre_${now.getFullYear()}.pdf`,
      ...SYSTEM_CONFIG.pdfOptions // Configurações padrão do sistema
    };

    // Gerar PDF
    const pdfData = await html2pdf()
      .set(opt)
      .from(document.getElementById('form-container'))
      .toPdf()
      .get('pdf')
      .then(pdf => ({
        blob: pdf.output('blob'),
        url: URL.createObjectURL(pdf.output('blob')),
        filename: opt.filename
      }));

    // Compartilhar via WhatsApp se solicitado
    if (share) {
      const message = `*PEDIDO DE REVISTAS - EBD*\n\n` +
        `*Congregação:* ${dados.congregacao || 'Não informado'}\n` +
        `*Coordenador:* ${dados.coordenador || 'Não informado'}\n` +
        `*Telefone:* ${dados.telefone || 'Não informado'}\n` +
        `*Trimestre:* ${trimester} Trimestre ${now.getFullYear()}\n` +
        `*Total:* ${formatCurrency(dados.total)}\n` +
        `Pedido completo em anexo.`;

      // Download automático do PDF
      const a = document.createElement('a');
      a.href = pdfData.url;
      a.download = pdfData.filename;
      a.click();

      // Abrir WhatsApp após pequeno delay
      setTimeout(() => {
        window.open(`https://wa.me/${SYSTEM_CONFIG.whatsappContact}?text=${encodeURIComponent(message)}`, '_blank');
        URL.revokeObjectURL(pdfData.url); // Limpar memória
      }, 500);
    }

  } finally {
    toggleLoading(false);
    document.querySelectorAll('.no-print').forEach(btn => btn.style.display = '');
  }
}

// Funções de apoio
function calcularTotal(itens) {
  return itens.reduce((total, item) => {
    // Supondo que cada item tenha um valor associado
    return total + (item.aluno * 10) + (item.professor * 10) + (item.kit * 15);
  }, 0);
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// Função para resetar o formulário
function resetForm() {
  // Resetar campos de texto
  ['congregation', 'group', 'coordinator', 'phone'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = '';
  });

  // Resetar quantidades e totais
  document.querySelectorAll('.qty-input').forEach(input => {
    input.value = '';
  });

  document.querySelectorAll('.subtotal').forEach(cell => {
    cell.textContent = 'R$ 0,00';
  });

  const totalElement = document.getElementById('total');
  if (totalElement) totalElement.textContent = 'R$ 0,00';

  showToast('Formulário limpo com sucesso!');
}
const congregationsByGroup = {
    grupo1: ["PORTA FORMOSA", "SAMARIA", " ÁGAPE", "CANÁ DA GALILÉIA"],
    grupo2: ["TEMPLO CENTRAL", "ALOÉS", "NOVA GALILÉIA", "GILGAL"],
    grupo3: ["BERSEBA", "PÃO DA VIDA", "MONTE SANTO", "MONTE DAS OLIVEIRA"],
    grupo4: ["EL SHADAY", "CORINTO", "DEUS PROVERÁ", "ÉFESO"],
    grupo5: ["SALMO 91", "MONTE HERMON", "FILADÉLFIA", "BETESDA"],
    grupo6: ["PENIEL", "NOVA JERUSALÉM", "VITÓRIA", "ROCHA ETERNA"],
    grupo7: ["VALE DO JORDÃO ", "JARDIM DE DEUS ", "CÂNTICO DE VITÓRIA ", "ROSA DE SARON "],
    grupo8: ["FONTE DE ÁGUA VIVA", "JEOVÁ JIRÉ", "NOVA VIDA", "P.P.ARCA DO SENHOR"],
    grupo9: ["GETSÊMANI", "MANÁ", "VAU DE JABOQUE", "NOVA ALIANÇA"],
    grupo10: ["CANTINHO DO CÉU", "BOM SAMARITANO", "TERRA SANTA", "JUDEIA"],
    grupo11: ["SEARA DO SENHOR", "TORRE FORTE", "CAFARNAUM", "MONTE SINAI"],
    grupo12: ["BRILHO CELESTE", "RAIZ DE JESSÉ", "JASPE", "MAANAIM"],
    grupo13: ["NOVA CANAÃ","MONTE SIÃO", "MONTE GERESIM" ],
    grupo14: ["SELO DA PROMESSA", "NINIVE", "SHEKINÁ", "MONTE HOREBE"],
    grupo15: ["SALVADOR", "BÁLSAMO DE GILEADE", "LÍRIO DOS VALES", "EL ELYON" ],
    grupo16: ["ALTO REFÚGIO", "SILOÉ", "MARANATA", "MANANCIAL"],
    grupo17: ["BETÂNIA", "SICAR", "POÇO DE JACÓ" ],
    grupo18: ["MONTE TABOR", "JOPE", "MONTE CARMELO"],
    grupo19: ["REVELAÇÃO", "NOVO HORIZONTE", "ORVALHO DE HERMOM", "MONTE MORIÁ"],
    grupo20: ["ELO DA SALVAÇÃO", "NOVA BETEL", "CESAREIA", "HEBROM"]


  };

  function updateCongregations() {
    const groupSelect = document.getElementById("group");
    const congregationSelect = document.getElementById("congregation");
    const selectedGroup = groupSelect.value;

    // Limpa opções anteriores
    congregationSelect.innerHTML = '<option value="">Selecione a congregação</option>';

    if (selectedGroup && congregationsByGroup[selectedGroup]) {
      congregationSelect.disabled = false;

      congregationsByGroup[selectedGroup].forEach(cong => {
        const option = document.createElement("option");
        option.value = cong.toLowerCase().replace(/\s+/g, '-');
        option.textContent = cong;
        congregationSelect.appendChild(option);
      });
    } else {
      congregationSelect.disabled = true;
    }
  }
 

