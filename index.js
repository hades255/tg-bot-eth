const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const botToken = "7371962147:AAGG5K2LFwhzE3ouVR2X3QM99cwJ9c0PMbE";
const bot = new TelegramBot(botToken, { polling: true });

let SETTINGS = [];

bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  let amount = match[1];
  console.log("/start", chatId, amount);
  if (amount && !isNaN(amount)) {
    amount = Number(amount);
    let dir = amount >= 0;
    amount = Math.abs(amount);
    const settings = getSetting();
    if (settings.find((item) => item.chatId === chatId)) {
      setSetting(
        settings.map((item) => ({
          ...item,
          amount: item.chatId === chatId ? amount : item.amount,
          dir: item.chatId === chatId ? dir : item.dir,
        }))
      );
      bot.sendMessage(chatId, "Bot updated!");
    } else {
      setSetting([...settings, { chatId, amount, dir }]);
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

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const settings = getSetting();
  const user = settings.find((item) => item.chatId === chatId);
  if (user) {
    bot.sendMessage(chatId, "Current Status: " + JSON.stringify(user));
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

/*
\n\n***${
  0.14277183 * Number(ethereumPrice)
} $***\n***${
  (0.14277183 * Number(ethereumPrice)) / Number(tetherPrice)
} USDT***
*/
const compare = ({ chatId, amount, dir }, ethereumPrice, tetherPrice) => {
  if ((dir && ethereumPrice > amount) || (!dir && ethereumPrice < amount)) {
    bot.sendMessage(chatId, `🤩`);
    setTimeout(() => {
      bot.sendMessage(
        chatId,
        `Ethereum price is now ${ethereumPrice} USD!\nTether price is now ${tetherPrice}`
      );
    }, 200);
    setTimeout(() => {
      endBot(chatId);
      bot.sendMessage(chatId, "Bot finished!");
    }, 1000);
  }
};

const onTimer = () => {
  (async () => {
    const settings = getSetting();
    if (settings.length) {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether&vs_currencies=usd"
      );
      const ethereumPrice = response.data.ethereum.usd;
      const tetherPrice = response.data.tether.usd;
      settings.forEach((setting) =>
        compare(setting, ethereumPrice, tetherPrice)
      );
    }
  })();
  setTimeout(() => {
    onTimer();
  }, 20000);
};

onTimer();

setInterval(() => {
  (async () => {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether&vs_currencies=usd"
    );
    const ethereumPrice = response.data.ethereum.usd;
    const tetherPrice = response.data.tether.usd;
    if (ethereumPrice < 3300 || ethereumPrice > 3450) {
      bot.sendMessage(
        7086461598,
        `Ethereum: ${ethereumPrice} USD\nTether: ${tetherPrice} USD`
      );
    }
  })();
}, 600000);

console.log("Start Bot");
