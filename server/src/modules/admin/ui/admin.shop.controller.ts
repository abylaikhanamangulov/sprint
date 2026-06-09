import TelegramBot from 'node-telegram-bot-api';
import { usersCol, coinPackagesCol } from '../../../core/database';
import { getAdminContext, setAdminState, AdminState } from './admin.context';

export async function showAdminShopMenu(bot: TelegramBot, chatId: number, userId: number, messageId?: number) {
  setAdminState(userId, 'AUTHENTICATED');
  
  let text = '🛒 <b>Управление Магазином (Пакеты Монет)</b>\n\n';
  
  const packages = await coinPackagesCol.find().toArray();
  const keyboard: TelegramBot.InlineKeyboardButton[][] = [];

  packages.forEach(pkg => {
    keyboard.push([{ text: `📦 ${pkg.name} (${pkg.coins} монет)`, callback_data: `admin_shop_edit_${pkg.id}` }]);
  });

  keyboard.push([{ text: '🔙 Главное меню', callback_data: 'admin_main_menu' }]);

  const opts = {
    parse_mode: 'HTML' as const,
    reply_markup: {
      inline_keyboard: keyboard
    }
  };

  if (messageId) {
    await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...opts }).catch(() => {});
  } else {
    await bot.sendMessage(chatId, text, opts);
  }
}

export async function showEditPackageMenu(bot: TelegramBot, chatId: number, packageId: string, messageId?: number) {
  const pkg = await coinPackagesCol.findOne({ id: packageId });
  if (!pkg) return;

  let text = `📦 <b>Редактирование: ${pkg.name}</b>\n\n`;
  text += `💰 Количество монет: ${pkg.coins}\n`;
  text += `⭐️ Цена (Stars): ${pkg.priceStars}\n`;
  text += `📉 Скидка (%): ${pkg.discount || 0}\n`;

  const opts = {
    parse_mode: 'HTML' as const,
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Изменить монеты', callback_data: `admin_shop_set_coins_${packageId}` }],
        [{ text: 'Изменить цену', callback_data: `admin_shop_set_price_${packageId}` }],
        [{ text: 'Изменить скидку', callback_data: `admin_shop_set_disc_${packageId}` }],
        [{ text: '🔙 Назад к списку', callback_data: 'admin_shop_menu' }]
      ]
    }
  };

  if (messageId) {
    await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...opts }).catch(() => {});
  } else {
    await bot.sendMessage(chatId, text, opts);
  }
}

export function registerAdminShopRoutes(bot: TelegramBot) {
  bot.on('callback_query', async (query) => {
    if (!query.message || !query.data) return;
    const chatId = query.message.chat.id;
    const userId = query.from.id;

    const user = await usersCol.findOne({ telegramId: userId });
    if (!user || !user.isAdmin) return;

    if (query.data === 'admin_shop_menu') {
      await showAdminShopMenu(bot, chatId, userId, query.message.message_id);
      await bot.answerCallbackQuery(query.id);
      return;
    }

    if (query.data.startsWith('admin_shop_edit_')) {
      const packageId = query.data.replace('admin_shop_edit_', '');
      await showEditPackageMenu(bot, chatId, packageId, query.message.message_id);
      await bot.answerCallbackQuery(query.id);
      return;
    }

    if (query.data.startsWith('admin_shop_set_')) {
      const parts = query.data.split('_');
      const field = parts[3]; // coins, price, disc
      const packageId = parts.slice(4).join('_');
      
      let stateName = '';
      if (field === 'coins') stateName = 'WAITING_SHOP_COINS';
      if (field === 'price') stateName = 'WAITING_SHOP_PRICE';
      if (field === 'disc') stateName = 'WAITING_SHOP_DISC';

      setAdminState(userId, stateName as AdminState, { packageId });
      
      await bot.sendMessage(chatId, 'Введите новое числовое значение:', {
        reply_markup: {
          inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'admin_action_cancel' }]]
        }
      });
      await bot.answerCallbackQuery(query.id);
    }
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    if (!userId || !msg.text) return;

    const user = await usersCol.findOne({ telegramId: userId });
    if (!user || !user.isAdmin) return;

    const ctx = getAdminContext(userId);

    if (['WAITING_SHOP_COINS', 'WAITING_SHOP_PRICE', 'WAITING_SHOP_DISC'].includes(ctx.state)) {
      const amount = parseInt(msg.text, 10);
      if (isNaN(amount) || amount < 0) {
        await bot.sendMessage(chatId, '❌ Пожалуйста, введите корректное положительное число.');
        return;
      }

      const packageId = ctx.packageId;
      if (!packageId) {
        setAdminState(userId, 'AUTHENTICATED');
        return;
      }

      const update: Record<string, number> = {};
      if (ctx.state === 'WAITING_SHOP_COINS') update.coins = amount;
      if (ctx.state === 'WAITING_SHOP_PRICE') update.priceStars = amount;
      if (ctx.state === 'WAITING_SHOP_DISC') update.discount = amount;

      await coinPackagesCol.updateOne({ id: packageId }, { $set: update });
      
      await bot.sendMessage(chatId, '✅ Значение успешно обновлено!');
      setAdminState(userId, 'AUTHENTICATED');
      await showEditPackageMenu(bot, chatId, packageId);
    }
  });
}
