import requests
import time
from telegram import Bot

# Replace 'YOUR_BOT_TOKEN' with your actual bot token
TOKEN = '7371962147:AAGG5K2LFwhzE3ouVR2X3QM99cwJ9c0PMbE'
CHAT_ID = 'YOUR_CHAT_ID'  # Replace with your chat ID
THRESHOLD = 3500

def get_eth_price():
    response = requests.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    data = response.json()
    return data['ethereum']['usd']

bot = Bot(token=TOKEN)

def send_alert(price):
    message = f'Alert! Ethereum price has reached ${price}'
    bot.send_message(chat_id=CHAT_ID, text=message)

while True:
    price = get_eth_price()
    if price > THRESHOLD:
        send_alert(price)
    time.sleep(300)  # Check every 5 minutes
