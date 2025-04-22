import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import crypto from 'crypto'; // Importar módulo para gerar nomes aleatórios
import path from 'path';


async function modifyPDF(nomeCompleto = "Nan_erro", horasDeEstudo = 0, interesses = "Nan_erro") {
  // Caminho para o PDF existente
  const pdfPath = './pdf/planoDeEstudoV2.pdf';
  const existingPdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);


  nomeCompleto = String(nomeCompleto || "Nan_erro");
  horasDeEstudo = isNaN(horasDeEstudo) ? 100 : horasDeEstudo;
  interesses = String(interesses || "Nan_erro");


  // Pegar as páginas do PDF
  const pages = pdfDoc.getPages();

  // Modificar a segunda página (adicionar nome, nível e interesses)
  const secondPage = pages[1]; // Segunda página (índice 1)   
  const thirdPage = pages[2]; // Terceira página (índice 2)

  // Determinar o nível com base nas horas de estudo
  let novoNivel = "A1"; // Padrão
  if (horasDeEstudo >= 36 && horasDeEstudo < 61) {
    novoNivel = "A2";
  } else if (horasDeEstudo >= 61 && horasDeEstudo < 72) {
    novoNivel = "B1";
  } else if (horasDeEstudo >= 72) {
    novoNivel = "B2";
  } 
  const parte1 = "Você já estudou ";
const parte2 = `${horasDeEstudo} horas. `;
let parte3 = "";


  // Adicionando textos com quebra automática se necessário
  let nomeParte1 = nomeCompleto.slice(0, 35); // Pega os primeiros 35 caracteres
  let nomeParte2 = nomeCompleto.length > 35 ? nomeCompleto.slice(35) : ""; // Pega o restante após os 35 caracteres

  secondPage.drawText(nomeParte1, { x: 150, y: 533, size: 24, color: rgb(1, 1, 1) });
  if (nomeParte2) {
    secondPage.drawText(nomeParte2, { x: 150, y: 533, size: 24, color: rgb(1, 1, 1) });
  }
  secondPage.drawText(novoNivel, { x: 205, y: 465, size: 24, color: rgb(1, 1, 1) });

  let interessesParte1 = interesses.slice(0, 33);
  let interessesParte2 = interesses.length > 33 ? interesses.slice(33, 66) : "";
  let interessesParte3 = interesses.length > 66 ? interesses.slice(66) : "";

  secondPage.drawText(interessesParte1, { x: 197, y: 395, size: 24, color: rgb(1, 1, 1) });
  if (interessesParte2) {
    secondPage.drawText(interessesParte2, { x: 197, y: 380, size: 24, color: rgb(1, 1, 1) });
  }
  if (interessesParte3) {
    secondPage.drawText(interessesParte3, { x: 197, y: 350, size: 24, color: rgb(1, 1, 1) });

  }

  const xInicial = 333;
  const yTexto = 405;
  const tamanhoFonte = 12;
  
  thirdPage.drawText(parte1, {
    x: xInicial,
    y: yTexto,
    size: tamanhoFonte,
    color: rgb(1, 1, 1)
  });

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const widthParte1 = helveticaFont.widthOfTextAtSize(parte1, tamanhoFonte);

// Desenhar a parte 2 (azul claro)
thirdPage.drawText(parte2, {
  x: xInicial + widthParte1,
  y: yTexto,
  size: tamanhoFonte,
  color: rgb(0.5, 0.8, 1) // Azul claro
});

// Calcular o tamanho da parte2

const widthParte2 = helveticaFont.widthOfTextAtSize(parte2, tamanhoFonte);


// Desenhar a parte 3 (branca)
thirdPage.drawText(parte3, {
  x: xInicial + widthParte1 + widthParte2,
  y: yTexto,
  size: tamanhoFonte,
  color: rgb(1, 1, 1)
});

  

  
  

  if (horasDeEstudo > 72) {
  const imagePath = './img/conclusao72.png';
if (fs.existsSync(imagePath)) {
  console.log("✅ Imagem encontrada, tentando carregar...");

  const imageBytes = fs.readFileSync(imagePath);
  const image = await pdfDoc.embedPng(imageBytes);

  console.log("✅ Imagem carregada com sucesso! Adicionando ao PDF...");

     thirdPage.drawImage(image, {
      x: 36,   // Distância da borda esquerda
      y: 238,  // Ajuste para garantir que está dentro da página
      width: 525,  // Ajuste do tamanho da imagem
      height: 343 // Ajuste do tamanho da imagem
    });

    console.log("✅ Imagem adicionada ao PDF!");
  } else {
    console.error("❌ Imagem não encontrada:", imagePath);
  }
}

const azulFluable = rgb(0.02, 0.75, 0.4);
const transparencia = 0.5;
const barraLarguraPadrao = 525;
const barraAlturaPadrao = 37;
const borderRadiusPadrao = 50;

// Define posições Y específicas para cada barra (de cima para baixo)
const posicoesPorNivel = {
  A1: [533],
  A2: [533, 497],
  B1: [533, 497, 460],
  B2: [533, 497, 460, 428]
};

const yPositions = posicoesPorNivel[novoNivel] || [540];

for (let i = 0; i < yPositions.length; i++) {
  let largura = barraLarguraPadrao;
  let altura = barraAlturaPadrao;

  // Se for o nível B2 e a quarta barra (índice 3), ajusta o tamanho
  if (novoNivel === "B2" && i === 3) {
    largura = 525; // reduz a largura, por exemplo
    altura = 33;   // reduz um pouco a altura
  }

  thirdPage.drawRectangle({
    x: 36,
    y: yPositions[i],
    width: largura,
    height: altura,
    color: azulFluable,
    opacity: transparencia,
    borderRadius: borderRadiusPadrao,
  });
}

  // Gerar um código aleatório para o nome do arquivo
  const randomCode = crypto.randomBytes(6).toString('hex'); // Gera um código hexadecimal aleatório
  const fileName = `Planner${randomCode}.pdf`;
  // Assegurando que o diretório de destino existe
  const outputDir = path.resolve('./pdf/gerados');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, fileName);
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);

  console.log('✅ PDF gerado com sucesso! Aproveite seu novo plano de estudo!');
  console.log(`Caminho completo do arquivo: ${filePath}`);

  return filePath; // Retorna o caminho absoluto do arquivo gerado
}

export { modifyPDF };
