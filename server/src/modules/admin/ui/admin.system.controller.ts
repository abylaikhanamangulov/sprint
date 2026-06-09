import TelegramBot from 'node-telegram-bot-api';
import { usersCol, tournamentsCol } from '../../../core/database';
import { getAdminContext, setAdminState } from './admin.context';
import { adminService } from '../admin.service';
import { MESSAGES } from '../../../constants/messages';

export async function showAdminSystemMenu(bot: TelegramBot, chatId: number, userId: number, messageId?: number) {
  setAdminState(userId, 'AUTHENTICATED');
  
  const settings = await adminService.getSystemSettings();
  
  let text = '⚙️ **Системное Управление**\n';
  text += `Режим тех. работ (Maintenance): ${settings.maintenanceMode ? '🔴 ВКЛЮЧЕН (Игроки не могут зайти)' : '🟢 ВЫКЛЮЧЕН'}\n`;

  const opts = {
    parse_mode: 'Markdown' as const,
    reply_markup: {
      inline_keyboard: [
        [{ text: settings.maintenanceMode ? '🟢 Отключить тех. работы' : '🔴 Включить тех. работы', callback_data: 'admin_sys_toggle_maint' }],
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

export function registerAdminSystemRoutes(bot: TelegramBot) {
  bot.on('callback_query', async (query) => {
    if (!query.message || !query.data) return;
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    const user = await usersCol.findOne({ id: userId });
    if (!user || !user.isAdmin) return;

    if (query.data === 'admin_menu_system') {
      await showAdminSystemMenu(bot, chatId, userId, query.message.message_id);
      await bot.answerCallbackQuery(query.id);
    }

    if (query.data === 'admin_sys_toggle_maint') {
      const settings = await adminService.getSystemSettings();
      await adminService.setMaintenanceMode(!settings.maintenanceMode);
      await showAdminSystemMenu(bot, chatId, userId, query.message.message_id);
      await bot.answerCallbackQuery(query.id, { text: `Тех. работы ${!settings.maintenanceMode ? 'включены' : 'выключены'}` });
    }

    if (query.data === 'admin_server_stats') {
      const stats = await adminService.getServerStats();
      await bot.sendMessage(chatId, MESSAGES.bot.adminServerStats(stats.totalUsers, stats.dau, stats.totalRaces), {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'admin_main_menu' }]] }
      });
      await bot.answerCallbackQuery(query.id);
    }

    if (query.data === 'admin_broadcast') {
      setAdminState(userId, 'WAITING_BROADCAST_MESSAGE');
      await bot.sendMessage(chatId, '📢 Введите текст для массовой рассылки всем пользователям бота (включает фото если прикреплено):', {
        reply_markup: {
          inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'admin_action_cancel' }]]
        }
      });
      await bot.answerCallbackQuery(query.id);
    }
    
    // Quick tournaments menu route since it's just a few functions
    if (query.data === 'admin_menu_tournaments') {
      const activeTournaments = await tournamentsCol.countDocuments({ status: 'active' });
      await bot.sendMessage(chatId, `🏆 Активных турниров: ${activeTournaments}\n\nДля переключения статуса введите ID (Функция еще в разработке)`, {
        reply_markup: {
          inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'admin_main_menu' }]]
        }
      });
      await bot.answerCallbackQuery(query.id);
    }
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    
    if (!userId || msg.text?.startsWith('/')) return;

    const user = await usersCol.findOne({ id: userId });
    if (!user || !user.isAdmin) return;

    const ctx = getAdminContext(userId);

    if (ctx.state === 'WAITING_BROADCAST_MESSAGE') {
      // Allow photo or text
      const text = msg.caption || msg.text || '';
      if (!text && !msg.photo) {
        await bot.sendMessage(chatId, '❌ Сообщение не содержит текста или фото.');
        return;
      }
      
      await bot.sendMessage(chatId, '⏳ Запущена рассылка, ожидайте...');
      setAdminState(userId, 'AUTHENTICATED');
      
      // If photo, sendPhoto, else sendMessage
      const users = await usersCol.find({ telegramId: { $exists: true, $ne: null as any } }).toArray();
      let sent = 0, failed = 0;
      
      for (const u of users) {
        if (!u.telegramId) continue;
        try {
          if (msg.photo && msg.photo.length > 0) {
            const photoId = msg.photo[msg.photo.length - 1].file_id;
            await bot.sendPhoto(u.telegramId, photoId, { caption: msg.caption });
          } else {
            await bot.sendMessage(u.telegramId, text);
          }
          sent++;
          await new Promise(r => setTimeout(r, 50));
        } catch (e) {
          failed++;
        }
      }
      await bot.sendMessage(chatId, `✅ Рассылка завершена.\nОтправлено: ${sent}\nОшибок (заблокировали бота): ${failed}`, {
        reply_markup: { inline_keyboard: [[{ text: '🔙 Главное меню', callback_data: 'admin_main_menu' }]] }
      });
    }
  });
}
