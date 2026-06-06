import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.BOT_TOKEN || '8616018832:AAG4yZYnks6Gh2eYTgHF601WWNw_uQ9onOc';
const CHANNEL_USERNAME = '@sprint_game';

// URL вашего Web App. Для работы кнопки в Telegram он обязан начинаться с https://
// Пока используем заглушку, либо подставится из .env файла
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://google.com';

export const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  if (!userId) return;

  try {
    let isSubscribed = false;
    try {
      const chatMember = await bot.getChatMember(CHANNEL_USERNAME, userId);
      isSubscribed = ['creator', 'administrator', 'member'].includes(chatMember.status);
    } catch (e: any) {
      // Telegram throws 400 if user is entirely unknown to the channel
      if (e.response && e.response.statusCode === 400) {
        isSubscribed = false;
      } else {
        throw e;
      }
    }

    if (isSubscribed) {
      await bot.sendMessage(chatId, 'Привет, гонщик! Добро пожаловать в Sprint 🏎️\nТвоя машина уже заведена, жми кнопку ниже и погнали!', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏁 Играть', web_app: { url: WEBAPP_URL } }]
          ]
        }
      });
    } else {
      await bot.sendMessage(chatId, 'Привет! Чтобы начать игру, необходимо подписаться на наш официальный канал.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📢 Подписаться на канал', url: `https://t.me/${CHANNEL_USERNAME.replace('@', '')}` }],
            [{ text: '✅ Проверить подписку', callback_data: 'check_sub' }]
          ]
        }
      });
    }
  } catch (error) {
    console.error('[Bot] Ошибка проверки подписки при старте:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при проверке подписки. Убедитесь, что бот является администратором в канале.');
  }
});

bot.on('callback_query', async (query) => {
  if (query.data === 'check_sub' && query.message) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    try {
      let isSubscribed = false;
      try {
        const chatMember = await bot.getChatMember(CHANNEL_USERNAME, userId);
        isSubscribed = ['creator', 'administrator', 'member'].includes(chatMember.status);
      } catch (e: any) {
        if (e.response && e.response.statusCode === 400) {
          isSubscribed = false;
        } else {
          throw e;
        }
      }

      if (isSubscribed) {
        await bot.editMessageText('Спасибо за подписку! Добро пожаловать в Sprint 🏎️\nЖми кнопку ниже и погнали!', {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🏁 Играть', web_app: { url: WEBAPP_URL } }]
            ]
          }
        });
      } else {
        await bot.answerCallbackQuery(query.id, { text: 'Вы еще не подписались на канал ❌', show_alert: true });
      }
    } catch (error) {
      console.error('[Bot] Ошибка проверки подписки (callback):', error);
      await bot.answerCallbackQuery(query.id, { text: 'Ошибка проверки', show_alert: true });
    }
  }
});

console.log('[Bot] Инициализирован и ожидает сообщений...');
