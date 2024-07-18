import requests
from telegram.ext import Updater, CommandHandler

def start(update, context):
    context.bot.send_message(chat_id=update.effective_chat.id, text="Bot started!")

def monitor_ethereum(update, context):
    ethereum_price = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd").json()["ethereum"]["usd"]
    if ethereum_price > 3500:
        context.bot.send_message(chat_id=update.effective_chat.id, text=f"Ethereum price is now {ethereum_price} USD!")

def main():
    updater = Updater(token='7371962147:AAGG5K2LFwhzE3ouVR2X3QM99cwJ9c0PMbE', use_context=True)
    dispatcher = updater.dispatcher
    start_handler = CommandHandler('start', start)
    monitor_handler = CommandHandler('monitor', monitor_ethereum)
    dispatcher.add_handler(start_handler)
    dispatcher.add_handler(monitor_handler)
    updater.start_polling()

if __name__ == '__main__':
    main()
