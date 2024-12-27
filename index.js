const TelegramBot = require('node-telegram-bot-api');

const dotenv = require('dotenv').config();
const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, {polling: true});
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (chatId != CHAT_ID) {
        bot.sendMessage(chatId, 'Unauthorized');
        return;
    }

    bot.sendMessage(chatId, "Hey! Welcome to reconzzz.");
});

async function fetchAndNotify() {
    try {
        const response = await axios.get(process.env.API_ENDPOINT + '/api/hosts');

        const data = response.data;

        if (data.status === 'success' && data.output) {
            const parsedOutput = JSON.parse(data.output);

            for (const program in parsedOutput) {
                const message = `${program}: ${parsedOutput[program]}`;
                await bot.sendMessage(CHAT_ID, message);
            }
        } else {
            await bot.sendMessage(CHAT_ID, 'Error: No se pudo ejecutar el comando correctamente.');
        }
    } catch (error) {
        console.error('Error al obtener datos o enviar mensajes:', error.message);
        await bot.sendMessage(CHAT_ID, 'Error al obtener datos o enviar notificaciones.');
    }
}

// Configura un intervalo para ejecutar la función cada dos horas
setInterval(fetchAndNotify, 2 * 60 * 60 * 1000); // 2 horas en milisegundos

// Opcional: Ejecuta la función inmediatamente al iniciar el bot
fetchAndNotify();