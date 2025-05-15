document.addEventListener('DOMContentLoaded', function() {
  setupTrimester();
  setupQuantityInputs();
  setupPhoneFormatting();
  
  // Vincula os eventos dos botões
  const btnEnviar = document.getElementById('btn-enviar');
  if (btnEnviar) {
    btnEnviar.addEventListener('click', generateAndSharePDF);
  }
  
  const btnVerificarCaptcha = document.getElementById('btn-verificar-captcha');
  if (btnVerificarCaptcha) {
    btnVerificarCaptcha.addEventListener('click', verificarCaptchaSelecao);
  }
});

// Variável global para controle do CAPTCHA
let captchaResolvido = false;

// Função para verificar o consentimento
function verificarConsentimentoCookies() {
  const consentimento = localStorage.getItem("cookieConsent");

  if (!consentimento) {
    document.getElementById("cookie-banner").style.display = "block";
  }
}

// Função para aceitar os cookies
function aceitarCookies() {
  localStorage.setItem("cookieConsent", "aceito");
  document.getElementById("cookie-banner").style.display = "none";
  console.log("Cookies aceitos.");
}

// Função para rejeitar os cookies
function rejeitarCookies() {
  localStorage.setItem("cookieConsent", "rejeitado");
  document.getElementById("cookie-banner").style.display = "none";
  console.log("Cookies rejeitados.");
}

// Executa ao carregar a página
window.onload = verificarConsentimentoCookies;

function setupTrimester() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const trimester = ["1º", "2º", "3º", "4º"][Math.floor(month / 3)];
  document.getElementById('trimester').textContent = ${trimester} TRIMESTRE ${year};
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
  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length > 2) {
        value = (${value.substring(0, 2)}) ${value.substring(2)};
      }
      if (value.length > 10) {
        value = ${value.substring(0, 10)}-${value.substring(10)};
      }
      e.target.value = value;
    }
  });
}

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
      setTimeout(() => {
        subtotalCell.style.backgroundColor = '';
      }, 500);
      grandTotal += rowTotal;
    }
  });

  const totalElement = document.getElementById('total');
  totalElement.textContent = formatCurrency(grandTotal);
  totalElement.style.transition = 'background-color 0.3s';
  totalElement.style.backgroundColor = '#f0f7ff';
  setTimeout(() => {
    totalElement.style.backgroundColor = '';
  }, 500);

  return grandTotal;
}

function formatCurrency(value) {
  return 'R$ ' + value.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, '$1.');
}

function resetForm() {
  document.getElementById('congregation').value = '';
  document.getElementById('group').value = '';
  document.getElementById('coordinator').value = '';
  document.getElementById('phone').value = '';

  document.querySelectorAll('.qty-input').forEach(input => {
    input.value = '';
  });

  document.querySelectorAll('.subtotal').forEach(cell => {
    cell.textContent = 'R$ 0,00';
  });

  document.getElementById('total').textContent = 'R$ 0,00';
  showToast('Formulário limpo com sucesso!');
}

function calculateTotal() {
  const total = calculateSubtotals();
  showToast(Total calculado: ${formatCurrency(total)});
}

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
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000);
}

function toggleLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  if (show) {
    overlay.classList.add('visible');
  } else {
    overlay.classList.remove('visible');
  }
}

// Variável para armazenar o código CAPTCHA atual
let currentCaptchaCode = '';

// Inicializa o CAPTCHA
function initCaptcha() {
  // Event listeners
  document.getElementById('not-robot-checkbox').addEventListener('change', function() {
    if (this.checked) {
      generateCaptchaCode();
      document.getElementById('captcha-code-container').style.display = 'block';
    } else {
      document.getElementById('captcha-code-container').style.display = 'none';
    }
  });

  document.getElementById('refresh-captcha').addEventListener('click', generateCaptchaCode);
  document.getElementById('verify-captcha').addEventListener('click', verifyCaptcha);
}

// Gera um novo código CAPTCHA
function generateCaptchaCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let code = '';

  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  currentCaptchaCode = code;
  document.getElementById('captcha-code').textContent = code;
  document.getElementById('captcha-input').value = '';
  document.getElementById('captcha-error').textContent = '';
}

// Verifica o CAPTCHA
function verifyCaptcha() {
  const checkbox = document.getElementById('not-robot-checkbox');
  const errorEl = document.getElementById('captcha-error');

  if (!checkbox.checked) {
    errorEl.textContent = 'Por favor, marque a caixa de verificação.';
    return false;
  }

  const userInput = document.getElementById('captcha-input').value.trim();

  if (userInput === '') {
    errorEl.textContent = 'Por favor, digite o código de verificação.';
    return false;
  }

  if (userInput !== currentCaptchaCode) {
    errorEl.textContent = 'Código incorreto. Tente novamente.';
    generateCaptchaCode();
    return false;
  }

  // CAPTCHA verificado com sucesso
  document.getElementById('captcha-modal').style.display = 'none';
  window.onCaptchaSuccess();
  return true;
}

// Mostra o CAPTCHA
function showCaptcha() {
  document.getElementById('not-robot-checkbox').checked = false;
  document.getElementById('captcha-code-container').style.display = 'none';
  document.getElementById('captcha-error').textContent = '';
  document.getElementById('captcha-modal').style.display = 'flex';
}

// Modifique sua função generateAndSharePDF para usar o CAPTCHA
function generateAndSharePDF() {
  showCaptcha();

  window.onCaptchaSuccess = function() {
    captchaResolvido = false;
    calculateSubtotals();

    const buttons = document.querySelectorAll('.no-print');
    buttons.forEach(btn => btn.style.display = 'none');

    const total = document.getElementById('total').textContent;
    if (total === 'R$ 0,00') {
      showToast('Adicione pelo menos um item ao pedido!');
      buttons.forEach(btn => btn.style.display = '');
      return;
    }

    toggleLoading(true);

    const element = document.getElementById('form-container');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const trimester = ["1º", "2º", "3º", "4º"][Math.floor(month / 2)];

    const a4Width = 794;
    const a4Height = 794;

    element.style.width = ${a4Width}px;
    element.style.padding = '10px';
    element.style.margin = '0 auto';
    element.style.transform = 'scale(1)';
    element.style.boxSizing = 'border-box';

    const opt = {
      margin: 0,
      filename: Pedido_Revistas_${trimester}_Trimestre_${year}.pdf,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    const congregation = document.getElementById('congregation').value || 'Não informado';
    const coordinator = document.getElementById('coordinator').value || 'Não informado';
    const phone = document.getElementById('phone').value || 'Não informado';

    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function(pdf) {
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const message = *PEDIDO DE REVISTAS - EBD*\n\n +
        *Congregação:* ${congregation}\n +
        *Coordenador:* ${coordinator}\n +
        *Telefone:* ${phone}\n +
        *Trimestre:* ${trimester} Trimestre ${year}\n +
        Pedido completo em anexo.;

      const whatsappUrl = https://wa.me/5591981918866?text=${encodeURIComponent(message)};

      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = opt.filename;
      document.body.appendChild(a);
      a.click();

      toggleLoading(false);

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        document.body.removeChild(a);
        URL.revokeObjectURL(pdfUrl);
        element.style.transform = "";
        element.style.transformOrigin = "";
        buttons.forEach(btn => btn.style.display = '');
      }, 1000);
    }).catch(err => {
      console.error('Erro ao gerar PDF:', err);
      toggleLoading(false);
      buttons.forEach(btn => btn.style.display = '');
      showToast('Erro ao gerar PDF. Por favor, tente novamente.');
    });
  };
}

document.addEventListener('DOMContentLoaded', function() {
  setupTrimester();
  setupQuantityInputs();
  setupPhoneFormatting();
  initCaptcha();

  const btnEnviar = document.getElementById('btn-enviar');
  if (btnEnviar) {
    btnEnviar.addEventListener('click', generateAndSharePDF);
  }

  const btnVerificarCaptcha = document.getElementById('btn-verificar-captcha');
  if (btnVerificarCaptcha) {
    btnVerificarCaptcha.addEventListener('click', verificarCaptchaSelecao);
  }
});
