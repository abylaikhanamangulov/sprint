import TelegramBot from 'node-telegram-bot-api';
import { usersCol } from '../../../core/database';
import { getAdminContext, setAdminState } from './admin.context';
import { adminService } from '../admin.service';

export async function showAdminUsersMenu(bot: TelegramBot, chatId: number, userId: number, messageId?: number) {
  setAdminState(userId, 'AUTHENTICATED');
  
  const text = '👥 <b>Управление Пользователями</b>\nВыберите действие:';
  const opts = {
    parse_mode: 'HTML' as const,
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔍 Найти пользователя (по ID)', callback_data: 'admin_users_search' }],
        [{ text: '🔙 Назад в меню', callback_data: 'admin_main_menu' }]
      ]
    }
  };

  if (messageId) {
    await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...opts }).catch(() => {});
  } else {
    await bot.sendMessage(chatId, text, opts);
  }
}

export async function showUserCard(bot: TelegramBot, chatId: number, adminId: number, targetUserId: number, messageId?: number) {
  const user = await usersCol.findOne({ id: targetUserId });
  if (!user) {
    await bot.sendMessage(chatId, `❌ Пользователь с ID ${targetUserId} не найден.`);
    return;
  }

  setAdminState(adminId, 'AUTHENTICATED', { targetUserId });

  const carsCount = user.ownedCars ? user.ownedCars.length : 0;
  let text = `👤 <b>Карточка Пользователя</b>\n`;
  text += `ID: <code>${user.id}</code>\n`;
  text += `Ник: @${user.username || 'unknown'} (${user.firstName || 'Нет имени'})\n`;
  text += `Уровень: ${user.level} (XP: ${user.xp}/${user.xpToNext})\n`;
  text += `Монеты: 💰 ${user.coins}\n`;
  text += `Энергия: ⚡ ${user.energy}/${user.maxEnergy}\n`;
  text += `Гараж: 🚗 ${carsCount} авто\n`;
  text += `Бан: ${user.isBanned ? '🔴 ДА' : '🟢 НЕТ'}\n`;
  if (user.isAdmin) text += `👑 <b>АДМИНИСТРАТОР</b>\n`;

  const opts = {
    parse_mode: 'HTML' as const,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '➕ Монеты', callback_data: 'admin_user_add_coins' },
          { text: '➖ Монеты', callback_data: 'admin_user_rem_coins' }
        ],
        [
          { text: '➕ Опыт (XP)', callback_data: 'admin_user_add_xp' },
          { text: '🔄 Изменить Уровень', callback_data: 'admin_user_set_level' }
        ],
        [
          { text: '➕ Выдать Авто', callback_data: 'admin_user_give_car' },
          { text: '➖ Забрать Авто', callback_data: 'admin_user_rem_car' }
        ],
        [
          { text: '⚡ Фулл Энергия', callback_data: 'admin_user_full_energy' },
          { text: '🏆 Выдать Ачивку', callback_data: 'admin_user_give_ach' }
        ],
        [
          { text: user.isBanned ? '✅ Разбанить' : '🚫 Забанить', callback_data: 'admin_user_toggle_ban' },
          { text: '⚠️ ВАЙП (Сброс)', callback_data: 'admin_user_wipe' }
        ],
        [{ text: '🔙 К списку/поиску', callback_data: 'admin_menu_users' }]
      ]
    }
  };

  if (messageId) {
    await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...opts }).catch(() => {});
  } else {
    await bot.sendMessage(chatId, text, opts);
  }
}

export function registerAdminUsersRoutes(bot: TelegramBot) {
  bot.on('callback_query', async (query) => {
    if (!query.message || !query.data) return;
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    const user = await usersCol.findOne({ telegramId: userId });
    if (!user || !user.isAdmin) return;

    const ctx = getAdminContext(userId);

    // Cancel any action
    if (query.data === 'admin_action_cancel') {
      setAdminState(userId, 'AUTHENTICATED');
      if (ctx.targetUserId) {
        await showUserCard(bot, chatId, userId, ctx.targetUserId);
      } else {
        await showAdminUsersMenu(bot, chatId, userId, query.message.message_id);
      }
      await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
      return bot.answerCallbackQuery(query.id);
    }

    if (query.data === 'admin_menu_users') {
      await showAdminUsersMenu(bot, chatId, userId, query.message.message_id);
      await bot.answerCallbackQuery(query.id);
    }

    if (query.data === 'admin_users_search') {
      setAdminState(userId, 'WAITING_USER_SEARCH');
      await bot.sendMessage(chatId, '🔍 Введите ID пользователя для поиска:', {
        reply_markup: {
          inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'admin_action_cancel' }]]
        }
      });
      await bot.answerCallbackQuery(query.id);
    }

    if (query.data === 'admin_user_toggle_ban') {
      if (ctx.targetUserId) {
        await adminService.toggleBan(ctx.targetUserId);
        await showUserCard(bot, chatId, userId, ctx.targetUserId, query.message.message_id);
      }
      await bot.answerCallbackQuery(query.id, { text: 'Статус бана изменен!' });
    }

    if (query.data === 'admin_user_full_energy') {
      if (ctx.targetUserId) {
        await adminService.restoreEnergy(ctx.targetUserId);
        await showUserCard(bot, chatId, userId, ctx.targetUserId, query.message.message_id);
      }
      await bot.answerCallbackQuery(query.id, { text: 'Энергия восстановлена!' });
    }

    // Money & XP prompt routes
    const promptMap: Record<string, { state: any, msg: string }> = {
      'admin_user_add_coins': { state: 'WAITING_USER_ADD_COINS', msg: '💰 Введите количество монет для ВЫДАЧИ:' },
      'admin_user_rem_coins': { state: 'WAITING_USER_REMOVE_COINS', msg: '💸 Введите количество монет для ИЗЪЯТИЯ:' },
      'admin_user_add_xp': { state: 'WAITING_USER_ADD_XP', msg: '📈 Введите количество Опыта (XP) для выдачи:' },
      'admin_user_set_level': { state: 'WAITING_USER_SET_LEVEL', msg: '🔄 Введите новый Уровень пользователя:' },
      'admin_user_give_car': { state: 'WAITING_USER_GIVE_CAR', msg: '🚗 Введите ID машины для выдачи:' },
      'admin_user_rem_car': { state: 'WAITING_USER_REMOVE_CAR', msg: '🗑️ Введите ID машины для изъятия (убедитесь что она есть в гараже):' },
      'admin_user_give_ach': { state: 'WAITING_USER_GIVE_ACH', msg: '🏆 Введите ID достижения:' },
    };

    if (promptMap[query.data]) {
      setAdminState(userId, promptMap[query.data].state);
      await bot.sendMessage(chatId, promptMap[query.data].msg, {
        reply_markup: {
          inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'admin_action_cancel' }]]
        }
      });
      await bot.answerCallbackQuery(query.id);
    }

    if (query.data === 'admin_user_wipe') {
      if (ctx.targetUserId) {
        await bot.sendMessage(chatId, `⚠️ <b>ВНИМАНИЕ!</b> Вы уверены что хотите полностью сбросить прогресс пользователя ${ctx.targetUserId}? Это необратимо!`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💀 ДА, УДАЛИТЬ ВСЕ', callback_data: 'admin_user_wipe_confirm' }],
              [{ text: '❌ Отмена', callback_data: 'admin_action_cancel' }]
            ]
          }
        });
      }
      await bot.answerCallbackQuery(query.id);
    }

    if (query.data === 'admin_user_wipe_confirm') {
      if (ctx.targetUserId) {
        await adminService.wipeUser(ctx.targetUserId);
        await bot.sendMessage(chatId, '✅ Прогресс пользователя успешно сброшен.');
        await showUserCard(bot, chatId, userId, ctx.targetUserId);
      }
      await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
      await bot.answerCallbackQuery(query.id);
    }
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const text = msg.text?.trim();

    if (!userId || !text || text.startsWith('/')) return;

    const user = await usersCol.findOne({ telegramId: userId });
    if (!user || !user.isAdmin) return;

    const ctx = getAdminContext(userId);

    if (ctx.state === 'WAITING_USER_SEARCH') {
      const targetId = parseInt(text, 10);
      if (isNaN(targetId)) return;
      await showUserCard(bot, chatId, userId, targetId);
    }

    // Number inputs for economy/stats
    const numValue = parseInt(text, 10);
    if (!isNaN(numValue) && ctx.targetUserId) {
      try {
        if (ctx.state === 'WAITING_USER_ADD_COINS') {
          await adminService.addCoins(ctx.targetUserId, numValue);
          await bot.sendMessage(chatId, `✅ Выдано ${numValue} монет.`);
          await showUserCard(bot, chatId, userId, ctx.targetUserId);
        } else if (ctx.state === 'WAITING_USER_REMOVE_COINS') {
          await adminService.removeCoins(ctx.targetUserId, numValue);
          await bot.sendMessage(chatId, `✅ Изъято ${numValue} монет.`);
          await showUserCard(bot, chatId, userId, ctx.targetUserId);
        } else if (ctx.state === 'WAITING_USER_ADD_XP') {
          await adminService.addXp(ctx.targetUserId, numValue);
          await bot.sendMessage(chatId, `✅ Выдано ${numValue} XP.`);
          await showUserCard(bot, chatId, userId, ctx.targetUserId);
        } else if (ctx.state === 'WAITING_USER_SET_LEVEL') {
          await adminService.setLevel(ctx.targetUserId, numValue);
          await bot.sendMessage(chatId, `✅ Уровень изменен на ${numValue}.`);
          await showUserCard(bot, chatId, userId, ctx.targetUserId);
        } else if (ctx.state === 'WAITING_USER_GIVE_CAR') {
          await adminService.giveCar(ctx.targetUserId, numValue);
          await bot.sendMessage(chatId, `✅ Автомобиль ID ${numValue} выдан.`);
          await showUserCard(bot, chatId, userId, ctx.targetUserId);
        } else if (ctx.state === 'WAITING_USER_REMOVE_CAR') {
          await adminService.removeCar(ctx.targetUserId, numValue);
          await bot.sendMessage(chatId, `✅ Автомобиль ID ${numValue} изъят.`);
          await showUserCard(bot, chatId, userId, ctx.targetUserId);
        } else if (ctx.state === 'WAITING_USER_GIVE_ACH') {
          await adminService.giveAchievement(ctx.targetUserId, numValue);
          await bot.sendMessage(chatId, `✅ Достижение выдано.`);
          await showUserCard(bot, chatId, userId, ctx.targetUserId);
        }
      } catch (e: any) {
        await bot.sendMessage(chatId, `❌ Ошибка: ${e.message}`);
        setAdminState(userId, 'AUTHENTICATED'); // reset
        await showUserCard(bot, chatId, userId, ctx.targetUserId);
      }
    }
  });
}
