import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { usersCol, achievementsCol } from './core/database';
import { MESSAGES } from './constants/messages';
import { adminService } from './modules/admin/admin.service';

dotenv.config();

type AdminState = 'WAITING_PASSWORD' | 'AUTHENTICATED' | 'WAITING_USER_ID_COINS' | 'WAITING_AMOUNT_COINS' | 'WAITING_USER_ID_ACHIEVEMENT' | 'WAITING_ACHIEVEMENT_ID' | 'WAITING_BROADCAST_MESSAGE' | 'WAITING_USER_ID_MANAGE' | 'WAITING_CAR_ID_TO_GIVE' | 'WAITING_CLAN_ID_TO_DELETE' | 'WAITING_TOURNAMENT_ID_TO_TOGGLE';
const adminStates: Record<number, AdminState> = {};
const adminData: Record<number, any> = {};

const token = process.env.BOT_TOKEN || '8616018832:AAG4yZYnks6Gh2eYTgHF601WWNw_uQ9onOc';
const CHANNEL_USERNAME = '@sprint_game';
const WEBAPP_URL = process.env.WEBAPP_URL || process.env.RENDER_EXTERNAL_URL || 'https://sprint-fbb9.onrender.com';

const isProduction = process.env.NODE_ENV === 'production';
export const bot = new TelegramBot(token, { polling: !isProduction });

if (isProduction && process.env.RENDER_EXTERNAL_URL) {
  const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/webhook/telegram`;
  bot.setWebHook(webhookUrl).then(() => {
    console.log(`[Bot] Webhook set to ${webhookUrl}`);
  });
} else {
  console.log('[Bot] Running in Polling mode');
}

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

bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  if (!userId) return;

  adminStates[userId] = 'WAITING_PASSWORD';
  await bot.sendMessage(chatId, MESSAGES.bot.adminEnterPassword);
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
      adminStates[userId] = 'WAITING_PASSWORD';
      await bot.sendMessage(chatId, MESSAGES.bot.adminWrongPassword);
    }
  } else if (state === 'WAITING_USER_ID_COINS') {
    const targetUserId = parseInt(text, 10);
    if (isNaN(targetUserId)) {
      await bot.sendMessage(chatId, MESSAGES.bot.adminInvalidId);
      return;
    }
    adminData[userId] = { targetUserId };
    adminStates[userId] = 'WAITING_AMOUNT_COINS';
    await bot.sendMessage(chatId, MESSAGES.bot.adminEnterCoins);
  } else if (state === 'WAITING_AMOUNT_COINS') {
    const coins = parseInt(text, 10);

    if (isNaN(coins)) {
      await bot.sendMessage(chatId, MESSAGES.bot.adminInvalidCoinsFormat);
      return;
    }

    const { targetUserId } = adminData[userId] || {};
    const user = await usersCol.findOne({ id: targetUserId });

    if (!user) {
      await bot.sendMessage(chatId, MESSAGES.bot.adminUserNotFound);
    } else {
      await usersCol.updateOne({ id: targetUserId }, { $inc: { coins } });
      await bot.sendMessage(chatId, MESSAGES.bot.adminCoinsSuccess(targetUserId, coins, user.coins + coins));
    }

    adminStates[userId] = 'AUTHENTICATED';
    await showAdminMenu(chatId);
  } else if (state === 'WAITING_USER_ID_ACHIEVEMENT') {
    const targetUserId = parseInt(text, 10);
    if (isNaN(targetUserId)) {
      await bot.sendMessage(chatId, MESSAGES.bot.adminInvalidId);
      return;
    }
    adminData[userId] = { targetUserId };
    adminStates[userId] = 'WAITING_ACHIEVEMENT_ID';
    await bot.sendMessage(chatId, MESSAGES.bot.adminEnterAchId);
  } else if (state === 'WAITING_ACHIEVEMENT_ID') {
    const achievementId = parseInt(text, 10);
    if (isNaN(achievementId)) {
      await bot.sendMessage(chatId, MESSAGES.bot.adminInvalidAchId);
      return;
    }

    const { targetUserId } = adminData[userId] || {};
    const user = await usersCol.findOne({ id: targetUserId });

    if (!user) {
      await bot.sendMessage(chatId, MESSAGES.bot.adminUserNotFound);
    } else {
      const ach = await achievementsCol.findOne({ id: achievementId });
      if (!ach) {
        await bot.sendMessage(chatId, MESSAGES.bot.adminAchNotFound);
      } else {
        const updateQuery: any = {};
        if (ach.condition.type === 'pvp_wins') updateQuery['stats.pvpWins'] = Math.max(user.stats.pvpWins, ach.condition.value);
        else if (ach.condition.type === 'total_races') updateQuery['stats.totalRaces'] = Math.max(user.stats.totalRaces, ach.condition.value);
        else if (ach.condition.type === 'win_streak') updateQuery['stats.longestWinStreak'] = Math.max(user.stats.longestWinStreak, ach.condition.value);
        else if (ach.condition.type === 'best_time') updateQuery['stats.bestTime'] = user.stats.bestTime === 0 ? ach.condition.value : Math.min(user.stats.bestTime, ach.condition.value);

        if (Object.keys(updateQuery).length > 0) {
          await usersCol.updateOne({ id: targetUserId }, { $set: updateQuery });
        }
        await bot.sendMessage(chatId, MESSAGES.bot.adminAchSuccess(ach.name, targetUserId));
      }
    }

    adminStates[userId] = 'AUTHENTICATED';
    await showAdminMenu(chatId);
  } else if (state === 'WAITING_BROADCAST_MESSAGE') {
    const result = await adminService.broadcastMessage(bot, text);
    await bot.sendMessage(chatId, MESSAGES.bot.adminBroadcastSuccess(result.sent, result.failed));
    adminStates[userId] = 'AUTHENTICATED';
    await showAdminMenu(chatId);
  } else if (state === 'WAITING_USER_ID_MANAGE') {
    const targetUserId = parseInt(text, 10);
    if (isNaN(targetUserId)) {
      await bot.sendMessage(chatId, MESSAGES.bot.adminInvalidId);
      return;
    }
    
    try {
      const { user, carsCount } = await adminService.inspectUser(targetUserId);
      adminData[userId] = { targetUserId };
      
      const userInfo = MESSAGES.bot.adminUserManageTitle(user.id, user.username || 'unknown') + 
        `\nУровень: ${user.level}\nМашин: ${carsCount}\nБан: ${user.isBanned ? 'Да' : 'Нет'}`;
        
      await bot.sendMessage(chatId, userInfo, {
        reply_markup: {
          inline_keyboard: [
            [{ text: user.isBanned ? MESSAGES.bot.adminBtnUnban : MESSAGES.bot.adminBtnBan, callback_data: 'admin_toggle_ban' }],
            [{ text: MESSAGES.bot.adminBtnGiveCar, callback_data: 'admin_give_car' }],
            [{ text: MESSAGES.bot.adminBtnRestoreEnergy, callback_data: 'admin_restore_energy' }]
          ]
        }
      });
      adminStates[userId] = 'AUTHENTICATED';
    } catch (e: any) {
      await bot.sendMessage(chatId, MESSAGES.bot.adminUserNotFound);
    }
  } else if (state === 'WAITING_CAR_ID_TO_GIVE') {
    const carId = parseInt(text, 10);
    if (isNaN(carId)) {
      await bot.sendMessage(chatId, MESSAGES.bot.adminInvalidId);
      return;
    }
    
    try {
      const { targetUserId } = adminData[userId] || {};
      const carName = await adminService.giveCar(targetUserId, carId);
      await bot.sendMessage(chatId, MESSAGES.bot.adminGiveCarSuccess(carName));
    } catch (e: any) {
      await bot.sendMessage(chatId, e.message);
    }
    
    adminStates[userId] = 'AUTHENTICATED';
    await showAdminMenu(chatId);
  } else if (state === 'WAITING_CLAN_ID_TO_DELETE') {
    const clanId = parseInt(text, 10);
    if (isNaN(clanId)) {
      await bot.sendMessage(chatId, MESSAGES.bot.adminInvalidId);
      return;
    }
    
    try {
      const clanName = await adminService.deleteClan(clanId);
      await bot.sendMessage(chatId, MESSAGES.bot.adminDeleteClanSuccess(clanName));
    } catch (e: any) {
      await bot.sendMessage(chatId, e.message);
    }
    
    adminStates[userId] = 'AUTHENTICATED';
    await showAdminMenu(chatId);
  } else if (state === 'WAITING_TOURNAMENT_ID_TO_TOGGLE') {
    const tourId = parseInt(text, 10);
    if (isNaN(tourId)) {
      await bot.sendMessage(chatId, MESSAGES.bot.adminInvalidId);
      return;
    }
    
    try {
      const status = await adminService.toggleTournament(tourId);
      await bot.sendMessage(chatId, MESSAGES.bot.adminToggleTournamentSuccess(status));
    } catch (e: any) {
      await bot.sendMessage(chatId, e.message);
    }
    
    adminStates[userId] = 'AUTHENTICATED';
    await showAdminMenu(chatId);
  }
});

async function showAdminMenu(chatId: number) {
  await bot.sendMessage(chatId, MESSAGES.bot.adminMenuTitle, {
    reply_markup: {
      inline_keyboard: [
        [{ text: MESSAGES.bot.adminBtnServerStats, callback_data: 'admin_server_stats' }],
        [{ text: MESSAGES.bot.adminBtnBroadcast, callback_data: 'admin_broadcast' }],
        [{ text: MESSAGES.bot.adminBtnManageUser, callback_data: 'admin_manage_user' }],
        [{ text: MESSAGES.bot.adminBtnManageClans, callback_data: 'admin_manage_clans' }],
        [{ text: MESSAGES.bot.adminBtnManageTournaments, callback_data: 'admin_manage_tournaments' }],
        [{ text: MESSAGES.bot.adminBtnGiveCoins, callback_data: 'admin_give_coins' }],
        [{ text: MESSAGES.bot.adminBtnGiveAch, callback_data: 'admin_give_ach' }],
        [{ text: MESSAGES.bot.adminBtnListUsers, callback_data: 'admin_list_users' }]
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

  // Admin callbacks
  if (query.data === 'admin_give_coins' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      adminStates[userId] = 'WAITING_USER_ID_COINS';
      await bot.sendMessage(query.message.chat.id, MESSAGES.bot.adminPromptCoinId);
      await bot.answerCallbackQuery(query.id);
    }
  }

  if (query.data === 'admin_give_ach' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      adminStates[userId] = 'WAITING_USER_ID_ACHIEVEMENT';
      await bot.sendMessage(query.message.chat.id, MESSAGES.bot.adminPromptAchId);
      await bot.answerCallbackQuery(query.id);
    }
  }

  if (query.data === 'admin_list_users' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      const users = await usersCol.find().limit(50).toArray();
      const totalUsers = await usersCol.countDocuments();
      let text = MESSAGES.bot.adminUsersListHeader(totalUsers);
      users.forEach(u => {
        text += `ID: ${u.id} | @${u.username || MESSAGES.bot.adminUnknownUser} | Lvl: ${u.level} | Coins: ${u.coins}${u.isAdmin ? MESSAGES.bot.adminStatusAdmin : ''}\n`;
      });
      if (totalUsers > 50) {
        text += MESSAGES.bot.adminUsersListMore(totalUsers - 50);
      }
      await bot.sendMessage(query.message.chat.id, text);
      await bot.answerCallbackQuery(query.id);
    }
  }

  // New admin callbacks
  if (query.data === 'admin_server_stats' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      const stats = await adminService.getServerStats();
      await bot.sendMessage(query.message.chat.id, MESSAGES.bot.adminServerStats(stats.totalUsers, stats.dau, stats.totalRaces));
      await bot.answerCallbackQuery(query.id);
    }
  }

  if (query.data === 'admin_broadcast' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      adminStates[userId] = 'WAITING_BROADCAST_MESSAGE';
      await bot.sendMessage(query.message.chat.id, MESSAGES.bot.adminPromptBroadcast);
      await bot.answerCallbackQuery(query.id);
    }
  }

  if (query.data === 'admin_manage_user' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      adminStates[userId] = 'WAITING_USER_ID_MANAGE';
      await bot.sendMessage(query.message.chat.id, MESSAGES.bot.adminPromptManageUser);
      await bot.answerCallbackQuery(query.id);
    }
  }

  if (query.data === 'admin_manage_clans' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      adminStates[userId] = 'WAITING_CLAN_ID_TO_DELETE';
      await bot.sendMessage(query.message.chat.id, MESSAGES.bot.adminPromptClanId);
      await bot.answerCallbackQuery(query.id);
    }
  }

  if (query.data === 'admin_manage_tournaments' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      adminStates[userId] = 'WAITING_TOURNAMENT_ID_TO_TOGGLE';
      await bot.sendMessage(query.message.chat.id, MESSAGES.bot.adminPromptTournamentId);
      await bot.answerCallbackQuery(query.id);
    }
  }

  // User Management actions
  if (query.data === 'admin_toggle_ban' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      const { targetUserId } = adminData[userId] || {};
      try {
        const isBanned = await adminService.toggleBan(targetUserId);
        await bot.sendMessage(query.message.chat.id, `Статус бана изменен. Теперь забанен: ${isBanned}`);
      } catch (e: any) {
        await bot.sendMessage(query.message.chat.id, e.message);
      }
      await bot.answerCallbackQuery(query.id);
    }
  }

  if (query.data === 'admin_give_car' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      adminStates[userId] = 'WAITING_CAR_ID_TO_GIVE';
      await bot.sendMessage(query.message.chat.id, MESSAGES.bot.adminPromptCarId);
      await bot.answerCallbackQuery(query.id);
    }
  }

  if (query.data === 'admin_restore_energy' && query.message) {
    const userId = query.from.id;
    if (adminStates[userId] === 'AUTHENTICATED') {
      const { targetUserId } = adminData[userId] || {};
      try {
        const energy = await adminService.restoreEnergy(targetUserId);
        await bot.sendMessage(query.message.chat.id, MESSAGES.bot.adminRestoreEnergySuccess(energy));
      } catch (e: any) {
        await bot.sendMessage(query.message.chat.id, e.message);
      }
      await bot.answerCallbackQuery(query.id);
    }
  }
});

console.log(MESSAGES.bot.botInit);
