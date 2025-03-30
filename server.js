import express from 'express';
import bodyParser from 'body-parser';
import { modifyPDF } from './index.js'; // Agora, a importação deve funcionar corretamente

const app = express();
const port = 3003;

app.use(bodyParser.json());

app.post('/generate-pdf', async (req, res) => {

  console.log('Dados recebidos:', req.body);  // Logar os dados recebidos


  const { nomeCompleto, horasDeEstudo, interesses } = req.body;

  try {
    const pdfFilename = await modifyPDF(nomeCompleto, horasDeEstudo, interesses);
    res.status(200).json({
      message: 'PDF gerado com sucesso!',
      filename: pdfFilename
    });
    console.log(pdfFilename)
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ message: 'Erro ao gerar PDF' });
  }
});


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
