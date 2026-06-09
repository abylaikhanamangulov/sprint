import TelegramBot from 'node-telegram-bot-api';
import { clearAdminState } from './admin.context';
import { usersCol } from '../../../core/database';

export const ADMIN_HELP_TEXT = `
📖 <b>Инструкция для Админов (God Mode)</b>

Эта панель предназначена для управления всеми аспектами игры напрямую из Telegram.

<b>👥 Пользователи</b>
Здесь вы можете найти любого игрока по ID и открыть его Карточку. 
- <i>Выдать/Снять валюту или опыт</i> - помогает, если игрок потерял ресурсы из-за бага, или нужно обнулить счет багоюзера.
- <i>Забанить</i> - блокирует доступ к игре.
- <i>Вайп (Сброс)</i> - полностью удаляет машины, баланс и статистику игрока, оставляя только регистрацию.
- <i>Управление гаражом</i> - позволяет забрать дубликаты машин или выдать уникальные авто.

<b>🛡️ Кланы</b>
Позволяет находить кланы по ID.
- <i>Переименовать</i> - если название или тег клана нарушают правила (мат, оскорбления).
- <i>Удалить участника</i> - если лидер клана не может этого сделать.
- <i>Сменить лидера</i> - если текущий лидер забанен или забросил игру.
- <i>Удалить клан</i> - распускает клан.

<b>⚙️ Система</b>
- <i>Тех. работы (Maintenance)</i> - отключает игру для всех пользователей (кроме админов). Рекомендуется включать перед крупным обновлением или при починке критических багов.
- <i>Рассылка</i> - отправляет сообщение всем зарегистрированным пользователям.

⚠️ Будьте осторожны! Любые действия (особенно "Вайп" и "Удалить клан") необратимы.
`;

export async function showAdminMenu(bot: TelegramBot, chatId: number, userId: number) {
  clearAdminState(userId);

  await bot.sendMessage(chatId, '🛠️ <b>Главное меню Админ-Панели</b>\nВыберите нужный раздел:', {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📊 Статистика сервера', callback_data: 'admin_server_stats' }],
        [{ text: '👥 Пользователи', callback_data: 'admin_menu_users' }, { text: '🛡️ Кланы', callback_data: 'admin_menu_clans' }],
        [{ text: '🏆 Турниры', callback_data: 'admin_menu_tournaments' }, { text: '🛒 Магазин', callback_data: 'admin_shop_menu' }],
        [{ text: '📢 Рассылка', callback_data: 'admin_broadcast' }, { text: '⚙️ Система', callback_data: 'admin_menu_system' }],
        [{ text: '📖 Инструкция', callback_data: 'admin_help' }],
        [{ text: '❌ Закрыть админку', callback_data: 'admin_close' }]
      ]
    }
  });
}

export function registerAdminMenuRoutes(bot: TelegramBot) {
  bot.on('callback_query', async (query) => {
    if (!query.message || !query.data) return;
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    // Check admin rights
    const user = await usersCol.findOne({ telegramId: userId });
    if (!user || !user.isAdmin) return;

    if (query.data === 'admin_main_menu') {
      await showAdminMenu(bot, chatId, userId);
      await bot.answerCallbackQuery(query.id);
    }
    
    if (query.data === 'admin_help') {
      await bot.sendMessage(chatId, ADMIN_HELP_TEXT, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'admin_main_menu' }]
          ]
        }
      });
      await bot.answerCallbackQuery(query.id);
    }

    if (query.data === 'admin_close') {
      await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
      await bot.answerCallbackQuery(query.id);
    }
  });
}
