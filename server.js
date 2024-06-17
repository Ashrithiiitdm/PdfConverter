import express from 'express';
import multer from 'multer';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import libre from 'libreoffice-convert';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))


app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const fpath = req.file.path;
        const ext = path.extname(fpath).toLowerCase();

        if(['.jpg', '.jpeg', '.png'].includes(ext)){
            const pdfBytes = await convertImgToPdf(fpath);
            const output = path.resolve(__dirname, `uploads/${Date.now()}.pdf`);
            fs.writeFileSync(output, pdfBytes);
            res.json({ filePath: `uploads/${path.basename(output)}` });
        } 
        else if(['.doc', '.docx','.odt','.txt'].includes(ext)){
            const output=path.resolve(__dirname,`uploads/${Date.now()}.pdf`);
            convertToPdf(fpath,output,(err)=>{
                if(err){
                    console.error('Error converting document to PDF:',err);
                    return res.status(500).json({error:'Internal Server Error'});
                }
                res.json({filePath:`uploads/${path.basename(output)}`});
            });
            
        }
        else {
            return res.status(404).json({ error: 'Unsupported file format' });
        }
    } 
    catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function convertImgToPdf(imagePath) {
    const pdfDoc = await PDFDocument.create();
    const imageBytes = fs.readFileSync(imagePath);

    let image;
    if(imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg')) {
        image = await pdfDoc.embedJpg(imageBytes);
    } 
    else if(imagePath.endsWith('.png')) {
        image = await pdfDoc.embedPng(imageBytes);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

    return await pdfDoc.save();
}

function convertToPdf(inputPath, outputPath, callback) {
    fs.readFile(inputPath,(readErr, file) =>{
        if(readErr){
            return callback(readErr);
        }

        libre.convert(file,'.pdf',undefined,(convertErr, done) => {
            if (convertErr) {
                return callback(convertErr);
            }

            fs.writeFile(outputPath, done, (writeErr) => {
                if (writeErr) {
                    return callback(writeErr);
                }

                callback(null);
            });
        });
    });
}

app.listen(port, () => {
    console.log(`The server is listening on port ${port}`);
});
