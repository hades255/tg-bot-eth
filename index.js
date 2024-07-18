const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const botToken = "7371962147:AAGG5K2LFwhzE3ouVR2X3QM99cwJ9c0PMbE";
const bot = new TelegramBot(botToken, { polling: true });

let SETTINGS = [];

bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const amount = match[1];
  console.log("/start", chatId, amount);
  if (amount && !isNaN(amount)) {
    const settings = getSetting();
    if (settings.find((item) => item.chatId === chatId)) {
      setSetting(
        settings.map((item) => ({
          ...item,
          amount: item.chatId === chatId ? amount : item.amount,
        }))
      );
      bot.sendMessage(chatId, "Bot updated!");
    } else {
      setSetting([...settings, { chatId, amount }]);
      bot.sendMessage(chatId, "Bot started!");
    }
  } else {
    bot.sendMessage(chatId, "Type correct amount!");
  }
});

bot.onText(/\/finish/, (msg) => {
  const chatId = msg.chat.id;
  const settings = getSetting();
  console.log("finish bot", chatId);
  if (settings.find((item) => item.chatId === chatId)) {
    endBot(chatId);
    bot.sendMessage(chatId, "Bot finished!");
  } else {
    bot.sendMessage(chatId, "/start first!");
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "/start amount - start Bot\n/finish - end bot\n/monitor - current eth\n\n/help - show help"
  );
});

bot.onText(/\/monitor/, async (msg) => {
  const chatId = msg.chat.id;
  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether&vs_currencies=usd"
  );
  const ethereumPrice = response.data.ethereum.usd;
  const tetherPrice = response.data.tether.usd;
  bot.sendMessage(
    chatId,
    `Ethereum price is now ${ethereumPrice} USD!\nTether price is now ${tetherPrice}`
  );
});

const getSetting = () => SETTINGS;

const setSetting = (params) => (SETTINGS = params);

const endBot = (chatId) =>
  setSetting(getSetting().filter((item) => item.chatId !== chatId));

const mainFunc = ({ chatId, amount }, ethereumPrice, tetherPrice) => {
  if (ethereumPrice > amount) {
    bot.sendMessage(chatId, `🤩`);
    setTimeout(() => {
      bot.sendMessage(
        chatId,
        `Ethereum price is now ${ethereumPrice} USD!\nTether price is now ${tetherPrice}\n\n***${
          0.14277183 * Number(ethereumPrice)
        } $***\n***${(0.14277183 * Number(ethereumPrice)) / Number(tetherPrice)} USDT***`
      );
    }, 200);
    setTimeout(() => {
      endBot(chatId);
      bot.sendMessage(chatId, "Bot finished!");
    }, 1000);
  }
};

const onTimer = () => {
  let settings = getSetting();
  if (settings.length) {
    (async () => {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether&vs_currencies=usd"
      );
      const ethereumPrice = response.data.ethereum.usd;
      const tetherPrice = response.data.tether.usd;
      settings = getSetting();
      settings.forEach((setting) =>
        mainFunc(setting, ethereumPrice, tetherPrice)
      );
    })();
  }
  setTimeout(() => {
    onTimer();
  }, 20000);
};

onTimer();

console.log("Start Bot");
