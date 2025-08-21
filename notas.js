const cabecalho = document.getElementById("cabecalho");
const corpo = document.getElementById("corpo");
const resultado = document.getElementById("resultado");
const blocoNotas = document.getElementById("blocoNotas");
const notasTexto = document.getElementById("notasTexto");
const blocosExtras = document.getElementById("blocosExtras");

let notaCount = 2; // duas notas iniciais

// ---------- Linhas ----------
function criarLinhas(qtd) {
  for (let i = 0; i < qtd; i++) {
    const tr = corpo.insertRow();

    const tdMateria = tr.insertCell();
    tdMateria.innerHTML = `<input class="full-input" type="text" placeholder="Matéria">`;

    for (let n = 0; n < notaCount; n++) {
      const tdNota = tr.insertCell();
      tdNota.innerHTML = `<input class="small-input" type="number" min="0" max="10" step="0.01" placeholder="0-10">`;
    }

    const tdME = tr.insertCell();
    tdME.innerHTML = `<input class="small-input" type="number" min="0" max="10" step="0.01" placeholder="Média">`;

    const tdMF = tr.insertCell();
    tdMF.innerHTML = `<span>-</span>`;
  }
}

function adicionarLinhas(qtd) { criarLinhas(qtd); }

// ---------- Colunas ----------
function adicionarNotaColuna() {
  const indexHeaderInsert = cabecalho.cells.length - 2;
  const th = document.createElement("th");
  th.textContent = `Nota ${notaCount + 1}`;
  th.className = "col-nota";
  cabecalho.insertBefore(th, cabecalho.cells[indexHeaderInsert]);

  Array.from(corpo.rows).forEach((row) => {
    const td = row.insertCell(indexHeaderInsert);
    td.innerHTML = `<input class="small-input" type="number" min="0" max="10" step="0.01" placeholder="0-10">`;
  });

  notaCount++;
}

// ---------- Médias ----------
function calcularMedias() {
  let somaTurma = 0;
  let contLinhasComMedia = 0;

  Array.from(corpo.rows).forEach((row) => {
    let soma = 0;
    let qtd = 0;
    for (let i = 1; i <= notaCount; i++) {
      const input = row.cells[i]?.querySelector("input");
      if (!input) continue;
      const v = parseFloat(input.value.replace(",", "."));
      if (!isNaN(v)) { soma += v; qtd++; }
    }
    const mediaCell = row.cells[row.cells.length - 1];
    if (qtd > 0) { 
      const m = soma / qtd; 
      mediaCell.textContent = m.toFixed(2);
      somaTurma += m; 
      contLinhasComMedia++;
    } else mediaCell.textContent = "-";
  });

  if (contLinhasComMedia === 0) { resultado.style.color = "black"; resultado.textContent = "Nenhuma nota informada!"; return; }

  const mediaGeral = somaTurma / contLinhasComMedia;
  if (mediaGeral >= 6) { resultado.style.color = "green"; resultado.textContent = `Média Geral: ${mediaGeral.toFixed(2)} ✅ Aprovado!`; }
  else { resultado.style.color = "red"; resultado.textContent = `Média Geral: ${mediaGeral.toFixed(2)} ❌ Reprovado!`; }
}

// ---------- Salvamento ----------
function salvarDados() {
  const linhas = Array.from(corpo.rows).map((row) => {
    const materia = row.cells[0].querySelector("input").value;
    const notas = [];
    for (let i = 1; i <= notaCount; i++) notas.push(row.cells[i].querySelector("input").value);
    const mediaEsp = row.cells[row.cells.length - 2].querySelector("input").value;
    const mediaFinal = row.cells[row.cells.length - 1].textContent;
    return { materia, notas, mediaEsp, mediaFinal };
  });

  const extras = [];
  document.querySelectorAll(".extraBloco").forEach((div) => {
    const titulo = div.querySelector(".titulo-bloco").value;
    const texto = div.querySelector("textarea").value;
    extras.push({ titulo, texto });
  });

  localStorage.setItem("notaCount", String(notaCount));
  localStorage.setItem("dadosNotasDynamic", JSON.stringify(linhas));
  localStorage.setItem("blocoNotas", notasTexto.value);
  localStorage.setItem("blocosExtras", JSON.stringify(extras));
  alert("✅ Informações salvas com sucesso!");
}

// ---------- Bloco lateral ----------
function toggleBlocoNotas() { blocoNotas.classList.toggle("closed"); }
function salvarNotas() { localStorage.setItem("blocoNotas", notasTexto.value); alert("📝 Bloco de notas salvo!"); }

// ---------- Blocos extras ----------
function adicionarBlocoExtra(conteudo = "", titulo = "Bloco Extra") {
  const div = document.createElement("div");
  div.className = "extraBloco";
  div.innerHTML = `
    <input class="titulo-bloco" type="text" value="${titulo}" />
    <textarea>${conteudo}</textarea>
    <div class="linha-acao">
      <button onclick="removerBlocoExtra(this)">🗑️ Remover</button>
      <button onclick="salvarDados()">💾 Salvar</button>
    </div>
  `;
  blocosExtras.appendChild(div);
}
function removerBlocoExtra(btn) { const bloco = btn.closest(".extraBloco"); if (bloco) bloco.remove(); }

// ---------- Restauração ----------
window.addEventListener("DOMContentLoaded", () => {
  const savedCount = parseInt(localStorage.getItem("notaCount") || "2", 10);
  for (let i = notaCount; i < Math.max(2, savedCount); i++) adicionarNotaColuna();
  criarLinhas(20);

  const dados = JSON.parse(localStorage.getItem("dadosNotasDynamic") || "null");
  if (Array.isArray(dados) && dados.length) {
    const faltam = dados.length - corpo.rows.length;
    if (faltam > 0) criarLinhas(faltam);
    dados.forEach((d, idx) => {
      const row = corpo.rows[idx];
      row.cells[0].querySelector("input").value = d.materia || "";
      for (let i = 1; i <= notaCount; i++) {
        const val = d.notas && d.notas[i-1] != null ? d.notas[i-1] : "";
        row.cells[i].querySelector("input").value = val;
      }
      row.cells[row.cells.length-2].querySelector("input").value = d.mediaEsp || "";
      row.cells[row.cells.length-1].textContent = d.mediaFinal || "-";
    });
  }

  const notasSalvas = localStorage.getItem("blocoNotas");
  if (notasSalvas) notasTexto.value = notasSalvas;

  const extras = JSON.parse(localStorage.getItem("blocosExtras") || "[]");
  if (Array.isArray(extras) && extras.length) extras.forEach((b) => adicionarBlocoExtra(b.texto || "", b.titulo || "Bloco Extra"));
});
