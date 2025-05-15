document.addEventListener('DOMContentLoaded', function() {
  setupTrimester();
  setupQuantityInputs();
  setupPhoneFormatting();
});
// Função para verificar o consentimento
function verificarConsentimentoCookies() {
  const consentimento = localStorage.getItem("cookieConsent");

  if (!consentimento) {
    // Mostra o banner se ainda não houver consentimento
    document.getElementById("cookie-banner").style.display = "block";
  }
}

// Função para aceitar os cookies
function aceitarCookies() {
  localStorage.setItem("cookieConsent", "aceito");
  document.getElementById("cookie-banner").style.display = "none";
  console.log("Cookies aceitos.");
  // Aqui você pode ativar scripts do Google Analytics, Facebook Pixel, etc.
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
  const trimester = ["1º", "2º", "3º", "4º"][Math.floor(month / 2)];
  document.getElementById('trimester').textContent = `${trimester} TRIMESTRE ${year}`;
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
        value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      }
      if (value.length > 10) {
        value = `${value.substring(0, 10)}-${value.substring(10)}`;
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
  showToast(`Total calculado: ${formatCurrency(total)}`);
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
let captchaCorreto = null;
let continuarEnvio = false;

function mostrarCaptchaSelecao() {
  const opcoes = [
    { texto: "Cachorro", correta: false },
    { texto: "Gato", correta: false },
    { texto: "Robô", correta: true } // Essa é a correta
  ];

  // Embaralha as opções
  opcoes.sort(() => 0.5 - Math.random());

  const container = document.getElementById('captcha-options');
  container.innerHTML = '';
  container.dataset.respostaCorreta = '';

  opcoes.forEach(opcao => {
    const btn = document.createElement('button');
    btn.textContent = opcao.texto;
    btn.style.padding = '10px 20px';
    btn.style.margin = '0 10px';
    btn.style.cursor = 'pointer';
    btn.style.border = '1px solid #ccc';
    btn.style.borderRadius = '5px';
    btn.style.backgroundColor = '#f0f0f0';

    btn.onclick = function () {
      document.querySelectorAll('#captcha-options button').forEach(b => b.style.backgroundColor = '#f0f0f0');
      btn.style.backgroundColor = '#a5d6a7';
      container.dataset.respostaCorreta = opcao.correta;
    };

    container.appendChild(btn);
  });

  document.getElementById('captcha-modal').style.display = 'flex';
}


function verificarCaptchaSelecao() {
  const container = document.getElementById('captcha-options');
  const correta = container.dataset.respostaCorreta === "true";

  if (correta) {
    document.getElementById('captcha-modal').style.display = 'none';
    continuarEnvio = true;
    generateAndSharePDF();
  } else {
    showToast('Selecione a imagem correta.');
  }
}


// 🔁 NOVA FUNÇÃO ATUALIZADA
function generateAndSharePDF() {
    
   // Impede execução até resolver o captcha
  if (!continuarEnvio) {
    mostrarCaptchaPersonalizado();
    return;
  }

  continuarEnvio = false; // reseta para não permitir envio sem novo CAPTCHA
  calculateSubtotals();
  // Esconde os botões temporariamente
const buttons = document.querySelectorAll('.no-print');
buttons.forEach(btn => btn.style.display = 'none');


  const total = document.getElementById('total').textContent;
  if (total === 'R$ 0,00') {
    showToast('Adicione pelo menos um item ao pedido!');
    return;
  }

  toggleLoading(true);

  const element = document.getElementById('form-container');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const trimester = ["1º", "2º", "3º", "4º"][Math.floor(month / 3)];

// AJUSTES PARA A4 PERFEITO (SEM EXCESSO DE EXPANSÃO)
  const a4Width = 794; // Valor ajustado entre 650-750px (experimente o melhor para seu layout)
  const a4Height = 794; // Altura A4 em pixels (297mm)

  // Aplicar estilos otimizados
  element.style.width = `${a4Width}px`;
  element.style.padding = '10px'; // Padding controlado
  element.style.margin = '0 auto'; // Centralizado
  element.style.transform = 'none'; // Remove qualquer scale anterior
  element.style.boxSizing = 'border-box';

  const opt = {
    margin: 0,
    filename: `Pedido_Revistas_${trimester}_Trimestre_${year}.pdf`,
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

    const message = `*PEDIDO DE REVISTAS - EBD*\n\n` +
      `*Congregação:* ${congregation}\n` +
      `*Coordenador:* ${coordinator}\n` +
      `*Telefone:* ${phone}\n` +
      `*Trimestre:* ${trimester} Trimestre ${year}\n` +
      `Pedido completo em anexo.`;

    const whatsappUrl = `https://wa.me/5591981918866?text=${encodeURIComponent(message)}`;

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

      // Restaura estilos
      element.style.transform = "";
      element.style.transformOrigin = "";
    }, 1000);
  }).catch(err => {
    console.error('Erro ao gerar PDF:', err);
    toggleLoading(false);
    showToast('Erro ao gerar PDF. Por favor, tente novamente.');
  });
}
