const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const removeAccents = require("remove-accents");

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Ruta para verificar que el servidor está activo
app.get("/", (req, res) => {
  res.send("<h1>Servicio activo</h1>");
});

app.post("/send-email", upload.single("attachment"), async (req, res) => {
  try {
    const { name, surname, tlf, subject, message, html } = req.body;

    let mailAttachment = [];
    const attachment = req.file;

    if (attachment) {
      const sanitizedFileName = removeAccents(attachment.originalname);
      const fileContent = attachment.buffer;
      mailAttachment = {
        filename: sanitizedFileName,
        content: fileContent,
      };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject,
      name,
      surname,
      tlf,
      message,
      html,
      attachments: mailAttachment,
    };

    await transporter.sendMail(mailOptions);

    if (attachment) {
      attachment.buffer = null;
    }

    res.status(200).send("Correo enviado exitosamente");
    console.log("Correo enviado exitosamente res.status(200).send");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).send("Error al enviar el correo");
  }
});

app.listen(() => {
  console.log(
    `Servicio activo, email_host: ${process.env.EMAIL_HOST}, email_port: ${process.env.EMAIL_PORT}, email_user: ${process.env.EMAIL_USERNAME}, email_pass: ${process.env.EMAIL_PASSWORD} `
  );
});
