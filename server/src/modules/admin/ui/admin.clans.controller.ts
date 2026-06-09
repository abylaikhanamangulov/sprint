import TelegramBot from 'node-telegram-bot-api';
import { clansCol, clanMembersCol, usersCol } from '../../../core/database';
import { getAdminContext, setAdminState } from './admin.context';
import { adminService } from '../admin.service';

export async function showAdminClansMenu(bot: TelegramBot, chatId: number, userId: number, messageId?: number) {
  setAdminState(userId, 'AUTHENTICATED');
  
  const text = '🛡️ **Управление Кланами**\nВыберите действие:';
  const opts = {
    parse_mode: 'Markdown' as const,
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔍 Найти клан (по ID)', callback_data: 'admin_clans_search' }],
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

export async function showClanCard(bot: TelegramBot, chatId: number, adminId: number, targetClanId: number, messageId?: number) {
  const clan = await clansCol.findOne({ id: targetClanId });
  if (!clan) {
    await bot.sendMessage(chatId, `❌ Клан с ID ${targetClanId} не найден.`);
    return;
  }

  setAdminState(adminId, 'AUTHENTICATED', { targetClanId });

  const membersCount = await clanMembersCol.countDocuments({ clanId: targetClanId });
  let text = `🛡️ **Карточка Клана**\n`;
  text += `ID: \`${clan.id}\`\n`;
  text += `Название: ${clan.name} [${clan.tag}]\n`;
  text += `Уровень: ${clan.level} (XP: ${clan.xp}/${clan.xpToNext})\n`;
  text += `Казна: 💰 ${clan.treasury}\n`;
  text += `Лидер (ID): \`${clan.leaderId}\`\n`;
  text += `Участников: 👥 ${membersCount}\n`;

  const opts = {
    parse_mode: 'Markdown' as const,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✏️ Название', callback_data: 'admin_clan_rename' },
          { text: '🔄 Лидер', callback_data: 'admin_clan_change_leader' }
        ],
        [
          { text: '➕ Выдать XP', callback_data: 'admin_clan_add_xp' },
          { text: '➖ Удалить игрока', callback_data: 'admin_clan_kick' }
        ],
        [
          { text: '❌ РАСПУСТИТЬ КЛАН', callback_data: 'admin_clan_delete' }
        ],
        [{ text: '🔙 К списку/поиску', callback_data: 'admin_menu_clans' }]
      ]
    }
  };

  if (messageId) {
    await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...opts }).catch(() => {});
  } else {
    await bot.sendMessage(chatId, text, opts);
  }
}

export function registerAdminClansRoutes(bot: TelegramBot) {
  bot.on('callback_query', async (query) => {
    if (!query.message || !query.data) return;
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    const user = await usersCol.findOne({ telegramId: userId });
    if (!user || !user.isAdmin) return;

    const ctx = getAdminContext(userId);

    if (query.data === 'admin_menu_clans') {
      await showAdminClansMenu(bot, chatId, userId, query.message.message_id);
      await bot.answerCallbackQuery(query.id);
    }

    if (query.data === 'admin_clans_search') {
      setAdminState(userId, 'WAITING_CLAN_SEARCH');
      await bot.sendMessage(chatId, '🔍 Введите ID клана для поиска:', {
        reply_markup: {
          inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'admin_action_cancel' }]]
        }
      });
      await bot.answerCallbackQuery(query.id);
    }

    const promptMap: Record<string, { state: any, msg: string }> = {
      'admin_clan_rename': { state: 'WAITING_CLAN_NEW_NAME', msg: '✏️ Введите новое название для клана:' },
      'admin_clan_change_leader': { state: 'WAITING_CLAN_NEW_LEADER', msg: '🔄 Введите ID нового лидера (должен быть участником клана):' },
      'admin_clan_add_xp': { state: 'WAITING_CLAN_ADD_XP', msg: '📈 Введите количество XP для выдачи клану:' },
      'admin_clan_kick': { state: 'WAITING_CLAN_KICK_MEMBER', msg: '👢 Введите ID участника, которого нужно исключить:' },
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

    if (query.data === 'admin_clan_delete') {
      if (ctx.targetClanId) {
        await bot.sendMessage(chatId, `⚠️ **ВНИМАНИЕ!** Вы уверены что хотите РАСПУСТИТЬ клан ${ctx.targetClanId}? Все его данные будут удалены.`, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💀 ДА, УДАЛИТЬ КЛАН', callback_data: 'admin_clan_delete_confirm' }],
              [{ text: '❌ Отмена', callback_data: 'admin_action_cancel' }]
            ]
          }
        });
      }
      await bot.answerCallbackQuery(query.id);
    }

    if (query.data === 'admin_clan_delete_confirm') {
      if (ctx.targetClanId) {
        await adminService.deleteClan(ctx.targetClanId);
        await bot.sendMessage(chatId, '✅ Клан успешно распущен и удалён.');
        await showAdminClansMenu(bot, chatId, userId);
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

    if (ctx.state === 'WAITING_CLAN_SEARCH') {
      const targetId = parseInt(text, 10);
      if (isNaN(targetId)) return;
      await showClanCard(bot, chatId, userId, targetId);
    }

    if (ctx.targetClanId) {
      try {
        if (ctx.state === 'WAITING_CLAN_NEW_NAME') {
          await adminService.renameClan(ctx.targetClanId, text);
          await bot.sendMessage(chatId, `✅ Клан переименован в "${text}".`);
          await showClanCard(bot, chatId, userId, ctx.targetClanId);
        } else if (ctx.state === 'WAITING_CLAN_NEW_LEADER') {
          const newLeaderId = parseInt(text, 10);
          if (!isNaN(newLeaderId)) {
            await adminService.changeClanLeader(ctx.targetClanId, newLeaderId);
            await bot.sendMessage(chatId, `✅ Лидер изменен.`);
            await showClanCard(bot, chatId, userId, ctx.targetClanId);
          }
        } else if (ctx.state === 'WAITING_CLAN_ADD_XP') {
          const xp = parseInt(text, 10);
          if (!isNaN(xp)) {
            await adminService.addClanXp(ctx.targetClanId, xp);
            await bot.sendMessage(chatId, `✅ Выдано ${xp} XP клану.`);
            await showClanCard(bot, chatId, userId, ctx.targetClanId);
          }
        } else if (ctx.state === 'WAITING_CLAN_KICK_MEMBER') {
          const targetMemberId = parseInt(text, 10);
          if (!isNaN(targetMemberId)) {
            await adminService.kickClanMember(ctx.targetClanId, targetMemberId);
            await bot.sendMessage(chatId, `✅ Игрок ${targetMemberId} исключен из клана.`);
            await showClanCard(bot, chatId, userId, ctx.targetClanId);
          }
        }
      } catch (e: any) {
        await bot.sendMessage(chatId, `❌ Ошибка: ${e.message}`);
        setAdminState(userId, 'AUTHENTICATED'); // reset
        await showClanCard(bot, chatId, userId, ctx.targetClanId);
      }
    }
  });
}
