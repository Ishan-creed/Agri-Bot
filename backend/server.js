// server.js
const express = require('express');
const bodyParser = require('body-parser');
const genai = require('@google/generative-ai');
const cors = require('cors');
const { createReadStream } = require('fs');
const { log } = require('console');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Configure Google AI
const genAi = new genai.GoogleGenerativeAI(process.env.GOOGLE_API_KEY)

// Load Generative Models
const textModel =  genAi.getGenerativeModel({model:"gemini-pro"});
const imageModel =  genAi.getGenerativeModel({model:"gemini-pro-vision"});

app.use(bodyParser.json());


app.get('/',(req,res)=>{
    res.send("Hello");
})


// Route to handle text input
app.post('/text', async (req, res) => {
    const question = req.body.question;
    console.log(question);
    try {
       const result = await textModel.generateContent(question);
       const response = await result.response;
       const text = response.text();
       res.json({ message: text });
    } catch (error) {
        console.error("Error generating text response:", error);
        res.status(500).send("Error generating text response");
    }
});

// Route to handle image input
app.post('/image', async (req, res) => {
    const question = req.body.question;
    const image = req.body.image;

    try {
        // Run the model with text and image input
        const result = await imageModel.generateContent([question, { inlineData: { data: image, mimeType: 'image/jpeg' } }]);
        
        // Retrieve the response text from the result
        const response = await result.response;
        const text = response.text();

         console.log(text);

        // Send the response back to the client
        res.json({ message: text });
    } catch (error) {
        // Log the error message to the console for debugging
        console.error('Error generating image response:', error);
        
        // Send the error message back to the client
        res.status(500).json({ success: false, message: 'Error generating image response. Please try again later.' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
