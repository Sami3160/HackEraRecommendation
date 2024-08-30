const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
require('dotenv').config()
app.use(bodyParser.json());

app.use(cors())
app.post('/recommend', (req, res) => {
    const userId = req.body.user_id;
    const productData = req.body.product_data;
    try {
        const csvData = productData.map(row =>
            `${row.user_id},${row.product_id},${row.product_name},${row.view_time},${row.visit_count},${row.liked}`
        ).join('\n');
        const tempFilePath = `input_data_${userId}.csv`;
        fs.writeFileSync(tempFilePath, `user_id,product_id,product_name,view_time,visit_count,liked\n${csvData}`);

        exec(`python3 recommendation.py ${tempFilePath}`, (error, stdout, stderr) => {
            fs.unlinkSync(tempFilePath);

            if (error) {
                console.error(`Error executing Python script: ${error}`);
                return res.status(500).send('Internal Server Error');
            }
            if (stderr) {
                console.error(`Python script error: ${stderr}`);
                return res.status(500).send('Internal Server Error');
            }
            const output = stdout.trim();
            // console.log(output);
            
            res.send(output);
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});