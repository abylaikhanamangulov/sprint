import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { dataStore, FILES } from './core/database';
import { User } from '@drag-racing/shared/types';

dotenv.config();

type AdminState = 'WAITING_PASSWORD' | 'AUTHENTICATED' | 'WAITING_USER_ID_COINS' | 'WAITING_AMOUNT_COINS' | 'WAITING_USER_ID_ACHIEVEMENT' | 'WAITING_ACHIEVEMENT_ID';
const adminStates: Record<number, AdminState> = {};
const adminData: Record<number, any> = {};

const token = process.env.BOT_TOKEN || '8616018832:AAG4yZYnks6Gh2eYTgHF601WWNw_uQ9onOc';
const CHANNEL_USERNAME = '@sprint_game';

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

bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  if (!userId) return;

  adminStates[userId] = 'WAITING_PASSWORD';
  await bot.sendMessage(chatId, 'Введите пароль администратора:');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const text = msg.text?.trim();

  if (!userId || !text || text.startsWith('/')) return;

  const state = adminStates[userId];
  if (!state) return;

  if (state === 'WAITING_PASSWORD') {
    if (text === '1111') {
      adminStates[userId] = 'AUTHENTICATED';
      await showAdminMenu(chatId);
    } else {
      adminStates[userId] = 'WAITING_PASSWORD'; // stay in wait
      await bot.sendMessage(chatId, 'Неверный пароль. Попробуйте еще раз или введите /start для отмены.');
    }
  } else if (state === 'WAITING_USER_ID_COINS') {
    const targetUserId = parseInt(text, 10);
    if (isNaN(targetUserId)) {
      await bot.sendMessage(chatId, 'Некорректный ID. Введите число:');
      return;
    }
    adminData[userId] = { targetUserId };
    adminStates[userId] = 'WAITING_AMOUNT_COINS';
    await bot.sendMessage(chatId, 'Введите количество coins (например: 1000):');
  } else if (state === 'WAITING_AMOUNT_COINS') {
    const coins = parseInt(text, 10);

    if (isNaN(coins)) {
      await bot.sendMessage(chatId, 'Некорректный формат. Введите число (coins):');
      return;
    }

    const { targetUserId } = adminData[userId] || {};
    const users = dataStore.get(FILES.USERS);
    const userIndex = users.findIndex(u => u.id === targetUserId);

    if (userIndex === -1) {
      await bot.sendMessage(chatId, 'Пользователь с таким ID не найден.');
    } else {
      const user = { ...users[userIndex] };
      user.coins += coins;
      users[userIndex] = user;
      dataStore.update(FILES.USERS, () => users);
      await bot.sendMessage(chatId, `✅ Успешно!\nПользователь ID ${targetUserId} получил ${coins} coins.\nТекущий баланс: ${user.coins} coins`);
    }

    adminStates[userId] = 'AUTHENTICATED';
    await showAdminMenu(chatId);
  } else if (state === 'WAITING_USER_ID_ACHIEVEMENT') {
    const targetUserId = parseInt(text, 10);
    if (isNaN(targetUserId)) {
      await bot.sendMessage(chatId, 'Некорректный ID. Введите число:');
      return;
    }
    adminData[userId] = { targetUserId };
    adminStates[userId] = 'WAITING_ACHIEVEMENT_ID';
    await bot.sendMessage(chatId, 'Введите ID достижения (число):');
  } else if (state === 'WAITING_ACHIEVEMENT_ID') {
    const achievementId = parseInt(text, 10);
    if (isNaN(achievementId)) {
      await bot.sendMessage(chatId, 'Некорректный ID достижения. Введите число:');
      return;
    }

    const { targetUserId } = adminData[userId] || {};
    const users = dataStore.get(FILES.USERS);
    const userIndex = users.findIndex(u => u.id === targetUserId);

    if (userIndex === -1) {
      await bot.sendMessage(chatId, 'Пользователь с таким ID не найден.');
    } else {
      const achievements = dataStore.get(FILES.ACHIEVEMENTS);
      const ach = achievements.find(a => a.id === achievementId);
      if (!ach) {
        await bot.sendMessage(chatId, 'Достижение с таким ID не найдено.');
      } else {
        const user = { ...users[userIndex] };
        // Achieve logic based on dynamic checks
        if (ach.condition.type === 'pvp_wins') user.stats.pvpWins = Math.max(user.stats.pvpWins, ach.condition.value);
        else if (ach.condition.type === 'total_races') user.stats.totalRaces = Math.max(user.stats.totalRaces, ach.condition.value);
        else if (ach.condition.type === 'win_streak') user.stats.longestWinStreak = Math.max(user.stats.longestWinStreak, ach.condition.value);
        else if (ach.condition.type === 'best_time') user.stats.bestTime = user.stats.bestTime === 0 ? ach.condition.value : Math.min(user.stats.bestTime, ach.condition.value);

        users[userIndex] = user;
        dataStore.update(FILES.USERS, () => users);
        await bot.sendMessage(chatId, `✅ Успешно! Для получения достижения "${ach.name}" обновлена статистика пользователя ${targetUserId}.`);
      }
    }

    adminStates[userId] = 'AUTHENTICATED';
    await showAdminMenu(chatId);
  }
});

async function showAdminMenu(chatId: number) {
  await bot.sendMessage(chatId, '🛠 Панель администратора', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💰 Выдать монеты', callback_data: 'admin_give_coins' }],
        [{ text: '🏆 Выдать достижение', callback_data: 'admin_give_ach' }]
      ]
    }
  });
}

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

  // Admin callbacks
  if (query.data === 'admin_give_coins' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      adminStates[userId] = 'WAITING_USER_ID_COINS';
      await bot.sendMessage(query.message.chat.id, 'Введите ID пользователя для выдачи монет:');
      await bot.answerCallbackQuery(query.id);
    }
  }

  if (query.data === 'admin_give_ach' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      adminStates[userId] = 'WAITING_USER_ID_ACHIEVEMENT';
      await bot.sendMessage(query.message.chat.id, 'Введите ID пользователя для выдачи достижения:');
      await bot.answerCallbackQuery(query.id);
    }
  }
});

console.log('[Bot] Инициализирован и ожидает сообщений...');
