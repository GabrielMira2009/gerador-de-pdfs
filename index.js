import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import crypto from 'crypto'; // Importar módulo para gerar nomes aleatórios
import path from 'path';

async function modifyPDF(nomeCompleto = "Nan_erro", horasDeEstudo = 0, interesses = "Nan_erro") {
  // Caminho para o PDF existente
  const pdfPath = './pdf/PlanoDeEstudoFluable_base.pdf';
  const existingPdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);


  nomeCompleto = String(nomeCompleto || "Nan_erro");
  horasDeEstudo = isNaN(horasDeEstudo) ? 0 : horasDeEstudo;
  interesses = String(interesses || "Nan_erro");


  // Pegar as páginas do PDF
  const pages = pdfDoc.getPages();

  // Modificar a segunda página (adicionar nome, nível e interesses)
  const secondPage = pages[1]; // Segunda página (índice 1)   

  // Determinar o nível com base nas horas de estudo
  let novoNivel = "A1"; // Padrão
  if (horasDeEstudo >= 10 && horasDeEstudo < 30) {
    novoNivel = "A2";
  } else if (horasDeEstudo >= 30 && horasDeEstudo < 60) {
    novoNivel = "B1";
  } else if (horasDeEstudo >= 60 && horasDeEstudo < 80) {
    novoNivel = "B2";
  } else if (horasDeEstudo >= 80 && horasDeEstudo < 100) {
    novoNivel = "C1";
  } else if (horasDeEstudo >= 100) {
    novoNivel = "C2";
  }


  // Adicionando textos com quebra automática se necessário
  let nomeParte1 = nomeCompleto.slice(0, 35); // Pega os primeiros 35 caracteres
  let nomeParte2 = nomeCompleto.length > 35 ? nomeCompleto.slice(35) : ""; // Pega o restante após os 35 caracteres

  secondPage.drawText(nomeParte1, { x: 180, y: 562, size: 24, color: rgb(1, 1, 1) });
  if (nomeParte2) {
    secondPage.drawText(nomeParte2, { x: 180, y: 528, size: 24, color: rgb(1, 1, 1) });
  }
  secondPage.drawText(novoNivel, { x: 230, y: 501, size: 24, color: rgb(1, 1, 1) });

  let interessesParte1 = interesses.slice(0, 33);
  let interessesParte2 = interesses.length > 33 ? interesses.slice(33, 66) : "";
  let interessesParte3 = interesses.length > 66 ? interesses.slice(66) : "";

  secondPage.drawText(interessesParte1, { x: 220, y: 438, size: 24, color: rgb(1, 1, 1) });
  if (interessesParte2) {
    secondPage.drawText(interessesParte2, { x: 220, y: 404, size: 24, color: rgb(1, 1, 1) });
  }
  if (interessesParte3) {
    secondPage.drawText(interessesParte3, { x: 220, y: 370, size: 24, color: rgb(1, 1, 1) });
  }

  const azulFluable = rgb(0.42, 0.89, 0.96);
  const transparencia = 0.2;
  const barraLarguraPadrao = 505;
  const barraAltura = 34;
  const borderRadiusPadrao = 50;
  const thirdPage = pages[2]; // Terceira página (índice 2)
  let yPos = 542; // Posição inicial da barra mais alta

  for (let i = 0; i <= 5; i++) { // Criar 6 barras de progresso
    if (novoNivel.charCodeAt(0) - 'A'.charCodeAt(0) + 1 > i) {
      thirdPage.drawRectangle({
        x: 45,
        y: yPos - (i * 34),
        width: barraLarguraPadrao,
        height: barraAltura,
        color: azulFluable,
        opacity: transparencia,
        borderRadius: borderRadiusPadrao,
      });
    }
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
