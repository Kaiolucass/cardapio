const produtos = [
  { id:1, cat:'Lanches', img:'img/hamburguer.png', name:'Noir Clássico', desc:'Blend 180g maturado, cheddar defumado, cebola caramelizada e aioli trufado', price:38 },
  { id:2, cat:'Lanches', img:'img/hamburguer2.png', name:'Bacon & Black', desc:'Blend 200g, bacon artesanal, queijo prato, rúcula e molho de mostarda dijon', price:44 },
  { id:3, cat:'Lanches', img:'img/hamburguer.png', name:'Smash Duplo', desc:'Dois blends finos de 90g, cheddar americano, picles e molho secreto da casa', price:42 },
  { id:4, cat:'Lanches', img:'img/hamburguer2.png', name:'Prime Angus', desc:'Blend angus 220g, brie, geleia de pimenta, rúcula e brioche artesanal', price:56 },
  { id:5, cat:'Batatas', img:'img/batata2.png', name:'Frites simples', desc:'Batata palito crocante com sal grosso e alecrim fresco', price:18 },
  { id:6, cat:'Batatas', img:'img/batata.png', name:'Frites black', desc:'Batata coberta com cheddar cremoso, bacon e cebolinha', price:26 },
  { id:7, cat:'Bebidas', img:'img/refri.png', name:'Refrigerante lata', desc:'Coca-Cola, Guaraná ou Sprite — 350ml gelada', price:8 },
  { id:8, cat:'Bebidas', img:'img/suco.png', name:'Suco natural', desc:'Laranja, maracujá ou abacaxi espremido na hora — 400ml', price:14 },
  { id:9, cat:'Bebidas', img:'img/breja.png', name:'Cerveja artesanal', desc:'IPA ou American Lager — 500ml', price:22 },
  { id:10, cat:'Combos', img:'img/image.png', name:'Combo Noir', desc:'Noir Clássico + Frites simples + Refrigerante', price:54 },
  { id:11, cat:'Combos', img:'img/image 2.png', name:'Combo Premium', desc:'Prime Angus + Frites black + Suco natural', price:76 },
];

// Número de WhatsApp do estabelecimento — TROCAR pelo número real
const WHATSAPP_NUMERO = '5561995938558';

// Horário de funcionamento — AJUSTAR conforme o estabelecimento (formato 24h)
const HORARIO_ABERTURA = 18; // abre às 18h
const HORARIO_FECHAMENTO = 23; // fecha às 23h

let cart = [];
let deliveryMode = 'retirada';
let paymentMode = 'pix';

function renderProducts(cat) {
  const grid = document.getElementById('products-grid');
  const label = document.getElementById('section-label');
  const filtered = cat === 'todos' ? produtos : produtos.filter(p => p.cat === cat);
  label.textContent = cat === 'todos' ? 'Cardápio completo' : cat;
  grid.innerHTML = filtered.map(p => `
    <div class="col-12 col-sm-6 col-lg-3">
      <div class="product-card" onclick="addToCart(${p.id})">
        <img class="product-img" src="${p.img}" alt="${p.name}">
        <div class="product-body">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-footer">
            <span class="product-price"><small>R$</small>${p.price},00</span>
            <button class="add-btn" onclick="event.stopPropagation();addToCart(${p.id})">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function filter(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat);
}

function addToCart(id) {
  const p = produtos.find(x => x.id === id);
  cart.push({ ...p, uid: Date.now() + Math.random() });
  updateCartUI();
}

function removeFromCart(uid) {
  cart = cart.filter(i => i.uid !== uid);
  updateCartUI();
}

function updateCartUI() {
  document.getElementById('cart-count').textContent = cart.length;
  const total = cart.reduce((s, i) => s + i.price, 0);
  document.getElementById('cart-total').textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
  document.getElementById('whats-btn').disabled = cart.length === 0;
  renderCartItems();
}

function renderCartItems() {
  const el = document.getElementById('cart-items');
  if (!cart.length) {
    el.innerHTML = '<p class="cart-empty">Nenhum item adicionado ainda.</p>';
    return;
  }
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">R$ ${item.price},00</p>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${item.uid})">×</button>
    </div>
  `).join('');
}

function openCart() {
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('overlay')) closeCart();
}

function selectDelivery(mode) {
  deliveryMode = mode;
  document.getElementById('opt-retirada').classList.toggle('selected', mode === 'retirada');
  document.getElementById('opt-delivery').classList.toggle('selected', mode === 'delivery');
  document.getElementById('endereco-block').classList.toggle('visible', mode === 'delivery');
}

function maskCEP(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
  input.value = v;
}

function buscarCEP() {
  const cep = document.getElementById('cep-input').value.replace(/\D/g, '');
  if (cep.length !== 8) return;
  const ruaInput = document.getElementById('rua-input');
  ruaInput.value = 'Buscando...';
  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(r => r.json())
    .then(d => {
      if (d.erro) {
        ruaInput.value = '';
        ruaInput.placeholder = 'CEP não encontrado, digite manualmente';
      } else {
        ruaInput.value = `${d.logradouro}, ${d.bairro} — ${d.localidade}`;
      }
    })
    .catch(() => {
      ruaInput.value = '';
      ruaInput.placeholder = 'Erro ao buscar CEP, digite manualmente';
    });
}

function usarLocalizacao() {
  const ruaInput = document.getElementById('rua-input');
  if (!navigator.geolocation) {
    ruaInput.placeholder = 'Localização não suportada, digite manualmente';
    return;
  }
  ruaInput.value = 'Obtendo localização...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      ruaInput.value = 'Buscando endereço...';
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`)
        .then(r => r.json())
        .then(d => {
          const partes = [d.locality, d.principalSubdivision, d.city].filter(Boolean);
          ruaInput.value = partes.join(', ') || 'Endereço aproximado — confira antes de enviar';
          document.getElementById('cep-input').value = '';
        })
        .catch(() => {
          ruaInput.value = '';
          ruaInput.placeholder = 'Não consegui buscar o endereço, digite manualmente';
        });
    },
    (err) => {
      const msgs = {
        1: 'Permissão negada — digite seu endereço manualmente',
        2: 'Localização indisponível — digite manualmente',
        3: 'Tempo esgotado — tente de novo ou digite manualmente'
      };
      ruaInput.value = '';
      ruaInput.placeholder = msgs[err.code] || 'Erro ao obter localização';
    }
  );
}

function selectPayment(mode) {
  paymentMode = mode;
  ['pix', 'credito', 'debito', 'dinheiro'].forEach(m => {
    document.getElementById('opt-' + m).classList.toggle('selected', m === mode);
  });
  document.getElementById('troco-row').style.display = mode === 'dinheiro' ? 'flex' : 'none';
}

function enviarWhats() {
  if (!cart.length) return;

  const ruaTxt = document.getElementById('rua-input').value.trim();
  const numero = document.getElementById('numero-input').value.trim();
  const complemento = document.getElementById('complemento-input').value.trim();

  if (deliveryMode === 'delivery' && (!ruaTxt || !numero)) {
    alert('Preencha o endereço e o número para continuar.');
    return;
  }

  const total = cart.reduce((s, i) => s + i.price, 0);
  const itens = cart.map(i => `• ${i.name} — R$ ${i.price},00`).join('\n');
  const entrega = deliveryMode === 'retirada'
    ? 'Retirada no local'
    : `Delivery — ${ruaTxt}, nº ${numero}${complemento ? ' (' + complemento + ')' : ''}`;
  const pagamentos = { pix: 'Pix', credito: 'Cartão de crédito', debito: 'Cartão de débito', dinheiro: 'Dinheiro' };
  const troco = paymentMode === 'dinheiro' && document.getElementById('troco-input').value
    ? ` (troco para R$ ${document.getElementById('troco-input').value})` : '';
  const msg = `*Novo pedido — My Burger*\n\n${itens}\n\n*Total:* R$ ${total.toFixed(2).replace('.', ',')}\n*Entrega:* ${entrega}\n*Pagamento:* ${pagamentos[paymentMode]}${troco}`;
  window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=` + encodeURIComponent(msg));
}

// ---- Status aberto/fechado, atualizado de verdade conforme o horário ----
function atualizarStatusAberto() {
  const badge = document.getElementById('status-badge');
  if (!badge) return;
  const agora = new Date();
  const horaAtual = agora.getHours() + agora.getMinutes() / 60;
  const aberto = horaAtual >= HORARIO_ABERTURA && horaAtual < HORARIO_FECHAMENTO;
  badge.textContent = aberto ? 'Aberto agora' : 'Fechado agora';
  badge.classList.toggle('fechado', !aberto);
}

renderProducts('todos');
atualizarStatusAberto();
setInterval(atualizarStatusAberto, 60000); // reavalia a cada minuto