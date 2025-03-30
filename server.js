import express from 'express';
import bodyParser from 'body-parser';
import { modifyPDF } from './index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3003;

app.use(bodyParser.json());

/**
 * @openapi
 * /generate-pdf:
 *   post:
 *     tags:
 *       - PDF Generation
 *     summary: Generate PDF
 *     description: >
 *       Generates a PDF based on the full name, study hours, and interests provided.
 *       Here is an example of how to make a request using curl:
 *       
 *       ```bash
 *       curl -X POST http://localhost:3003/generate-pdf \
 *           -H "Content-Type: application/json" \
 *           -d '{
 *               "nomeCompleto": "Nome da Pessoa",
 *               "horasDeEstudo": 100,
 *               "interesses": ["Tecnologia", "Programação", "Inovação"]
 *             }'
 *       ```
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomeCompleto:
 *                 type: string
 *                 description: Full name of the person.
 *               horasDeEstudo:
 *                 type: integer
 *                 description: Number of study hours.
 *               interesses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of interests.
 *     responses:
 *       200:
 *         description: PDF generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 filename:
 *                   type: string
 *       500:
 *         description: Error generating PDF.
 */

if (process.env.NODE_ENV === 'development') {
    const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'PDF Generation API',
                version: '1.0.0',
                description: 'API to generate PDFs based on user input',
            },
            servers: [
                {
                    url: 'http://localhost:3003',
                    description: 'Development server',
                },
            ],
        },
        apis: ['./server.js'], // Assuming this file is server.js
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.post('/generate-pdf', async (req, res) => {
    console.log('Dados recebidos:', req.body);  // Log the received data

    const { nomeCompleto, horasDeEstudo, interesses } = req.body;

    try {
        const pdfFilename = await modifyPDF(nomeCompleto, horasDeEstudo, interesses);
        res.status(200).json({
            message: 'PDF gerado com sucesso!',
            filename: pdfFilename
        });
        console.log(pdfFilename);
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).json({ message: 'Erro ao gerar PDF' });
    }
});


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}\n http://localhost:3003/api-docs`);
});
