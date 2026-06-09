import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { usersCol } from './core/database';
import { MESSAGES } from './constants/messages';
import { registerAdminMenuRoutes } from './modules/admin/ui/admin.menu.controller';
import { registerAdminUsersRoutes } from './modules/admin/ui/admin.users.controller';
import { registerAdminClansRoutes } from './modules/admin/ui/admin.clans.controller';
import { registerAdminSystemRoutes } from './modules/admin/ui/admin.system.controller';
import { adminService } from './modules/admin/admin.service';

dotenv.config();

const token = process.env.BOT_TOKEN || '8616018832:AAG4yZYnks6Gh2eYTgHF601WWNw_uQ9onOc';
const CHANNEL_USERNAME = '@sprint_game';
const WEBAPP_URL = process.env.WEBAPP_URL || process.env.RENDER_EXTERNAL_URL || 'https://sprint-fbb9.onrender.com';

const isProduction = process.env.NODE_ENV === 'production';
export const bot = new TelegramBot(token, { polling: false });

export function startBot() {
  if (isProduction && process.env.RENDER_EXTERNAL_URL) {
    const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/webhook/telegram`;
    bot.setWebHook(webhookUrl).then(() => {
      console.log(`[Bot] Webhook set to ${webhookUrl}`);
    });
  } else {
    bot.startPolling();
    console.log('[Bot] Running in Polling mode');
  }

  bot.on('polling_error', (error) => {
    console.error(`[Bot Polling Error]`, error);
  });
}

// -----------------------------------------
// User Routes
// -----------------------------------------
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  if (!userId) return;

  // Maintenance check
  const settings = await adminService.getSystemSettings();
  const user = await usersCol.findOne({ telegramId: userId });
  if (settings.maintenanceMode && (!user || !user.isAdmin)) {
    await bot.sendMessage(chatId, '🛠 **Ведутся технические работы.** Сервер временно недоступен. Пожалуйста, зайдите позже.', { parse_mode: 'Markdown' });
    return;
  }

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
      await bot.sendMessage(chatId, MESSAGES.bot.welcome, {
        reply_markup: {
          inline_keyboard: [
            [{ text: MESSAGES.bot.playButton, web_app: { url: WEBAPP_URL } }]
          ]
        }
      });
    } else {
      await bot.sendMessage(chatId, MESSAGES.bot.subscribeRequired, {
        reply_markup: {
          inline_keyboard: [
            [{ text: MESSAGES.bot.subscribeButton, url: `https://t.me/${CHANNEL_USERNAME.replace('@', '')}` }],
            [{ text: MESSAGES.bot.checkSubButton, callback_data: 'check_sub' }]
          ]
        }
      });
    }
  } catch (error) {
    console.error(MESSAGES.bot.botSubErrorLog, error);
    await bot.sendMessage(chatId, MESSAGES.bot.subCheckError);
  }
});

bot.on('callback_query', async (query) => {
  if (query.data === 'check_sub' && query.message) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    // Maintenance check
    const settings = await adminService.getSystemSettings();
    const user = await usersCol.findOne({ telegramId: userId });
    if (settings.maintenanceMode && (!user || !user.isAdmin)) {
      await bot.answerCallbackQuery(query.id, { text: 'Ведутся технические работы.', show_alert: true });
      return;
    }

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
        await bot.editMessageText(MESSAGES.bot.subThanks, {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [{ text: MESSAGES.bot.playButton, web_app: { url: WEBAPP_URL } }]
            ]
          }
        });
      } else {
        await bot.answerCallbackQuery(query.id, { text: MESSAGES.bot.subNotSubscribed, show_alert: true });
      }
    } catch (error) {
      console.error(MESSAGES.bot.botSubCheckErrorLog, error);
      await bot.answerCallbackQuery(query.id, { text: MESSAGES.bot.subCheckErrorAlert, show_alert: true });
    }
  }
});

// -----------------------------------------
// Admin Routes
// -----------------------------------------
bot.onText(/\/admin(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const param = match ? match[1].trim() : '';

  if (!userId) return;

  const user = await usersCol.findOne({ telegramId: userId });
  if (!user || !user.isAdmin) {
    // Secret fallback to set the first admin if none exist
    const adminCount = await usersCol.countDocuments({ isAdmin: true });
    if (adminCount === 0 && param === '1111') {
      if (user) {
        await usersCol.updateOne({ id: userId }, { $set: { isAdmin: true } });
      } else {
        // Just in case they haven't run /start, we create a stub user
        await usersCol.insertOne({ id: userId, telegramId: userId, isAdmin: true, username: msg.from?.username || '', firstName: msg.from?.first_name || '', avatarUrl: '', level: 1, xp: 0, xpToNext: 100, coins: 0, energy: 20, maxEnergy: 20, lastEnergyRegen: new Date().toISOString(), rankPoints: 0, rankTier: 1, selectedCarId: null, ownedCars: [], clanId: null, dailyStreak: 0, lastDailyReward: null, stats: { totalRaces: 0, pvpWins: 0, pvpLosses: 0, bestTime: 0, perfectShifts: 0, longestWinStreak: 0, coinsEarned: 0 }, settings: { language: 'ru', soundEffects: true, music: true, musicVolume: 50, vibration: true, graphicsQuality: 'medium', notifications: true, showFps: false }, createdAt: new Date().toISOString() });
      }
      await bot.sendMessage(chatId, '👑 Вы получили права Администратора. Введите /admin для входа в панель.');
      return;
    }
    await bot.sendMessage(chatId, '❌ У вас нет прав администратора.');
    return;
  }

  // If user is admin, show the new admin menu directly
  const { showAdminMenu } = await import('./modules/admin/ui/admin.menu.controller');
  await showAdminMenu(bot, chatId, userId);
});

// Register all modular admin routes
registerAdminMenuRoutes(bot);
registerAdminUsersRoutes(bot);
registerAdminClansRoutes(bot);
registerAdminSystemRoutes(bot);

console.log(MESSAGES.bot.botInit);
