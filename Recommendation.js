const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function handleRecommendation(req, res) {
    const userId = req.body.user_id;
    const productData = req.body.product_data;

    try {
        // Convert productData to CSV string
        const csvData = productData.map(row =>
            `${row.user_id},${row.product_id},${row.product_name},${row.view_time},${row.visit_count},${row.liked}`
        ).join('\n');
        const tempFilePath = path.join(__dirname, `input_data_${userId}.csv`);
        fs.writeFileSync(tempFilePath, `user_id,product_id,product_name,view_time,visit_count,liked\n${csvData}`);

        // Execute the Python script and pass the file path as an argument
        exec(`python3 recommendation.py ${tempFilePath}`, (error, stdout, stderr) => {
            fs.unlinkSync(tempFilePath); // Clean up the temporary file

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
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    handleRecommendation
};