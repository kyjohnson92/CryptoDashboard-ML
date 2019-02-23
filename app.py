from datetime import datetime
from flask import Flask, jsonify,render_template,send_from_directory
from flask_mysqldb import MySQL
import os
import json
import mysql.connector
import pymysql
import requests
from sqlalchemy import create_engine, Table, Column, Integer,DateTime,String, MetaData, inspect, Float
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session



host="localhost"
user="root"
passwd="password"
db = 'mydatabase'
port = 3306
engine = create_engine('mysql+pymysql://' + user + ':' + passwd + '@' + host + ':' + str(port) + '/' + db, echo=False)



Base = declarative_base()
Base.metadata.reflect(engine)



class Crypto(Base):
    __table__ = Base.metadata.tables['cryptocurrency']




Base = automap_base()
Base.prepare(engine, reflect=True)
Crypto = Base.classes.cryptocurrency
session = Session(engine)
inspector = inspect(engine)




app = Flask(__name__)



@app.route("/")
def index():
    return render_template("index.html")

@app.route("/coinData")
def coin_data():
    return render_template("coinData.html")

@app.route("/forecast")
def price_forecast():
    return render_template("forecast.html")

@app.route("/sentiment")
def sentiment_analysis():
    return render_template("sentiment.html")

@app.route("/data")
def datareturn():
    json_data= []
    for row in session.query(Crypto.date, Crypto.btc_price, Crypto.btc_market_cap, Crypto.eth_price,Crypto.eth_market_cap,Crypto.eos_price,Crypto.eos_market_cap).all():
        daily_data = {}
        
        daily_data['date'] = row[0]
        daily_data['btc_price'] = (float(row[1]))
        daily_data['btc_mcap']= (float(row[2]))
        daily_data['eth_price']= (float(row[3]))
        daily_data['eth_mcap']= (float(row[4]))
        daily_data['eos_price']= (float(row[5]))
        daily_data['eos_mcap']= (float(row[6]))
        json_data.append(daily_data)
    return jsonify(json_data)

@app.route("/usd/<enddate>")
def usdprice(enddate):
    api_url = "https://coinmetrics.io/api/v1/get_asset_data_for_time_range/btc/price(usd)/1367107200/1550934383"
    r = requests.get(api_url)
    new_array = []
    re = json.loads(r.content.decode())
    x = 0
    for i in re["result"]:
        dict = {i[0]:i[1]}
        new_array.append(dict)
    return jsonify(new_array)

@app.route("/data/<asset>")
def assetreturn(asset):
    asset_data = []
    if asset.lower() == "eth":
        for row in session.query(Crypto.date, Crypto.eth_price).filter(Crypto.eth_price > 0):
            daily_data = {}
            daily_data['date'] = row[0]
            daily_data['eth_price'] = (float(row[1]))
            asset_data.append(daily_data)
    elif asset.lower() == "btc":
        for row in session.query(Crypto.date, Crypto.btc_price).filter(Crypto.btc_price > 0):
            daily_data = {}
            daily_data['date'] = row[0]
            daily_data['btc_price'] = (float(row[1]))
            asset_data.append(daily_data)
    else:
        for row in session.query(Crypto.date, Crypto.eos_price).filter(Crypto.eos_price > 0):
            daily_data = {}
            daily_data['date'] = row[0]
            daily_data['eos_price'] = (float(row[1]))   
            asset_data.append(daily_data)         
            asset_data.append(daily_data)
    return jsonify(asset_data)

@app.route("/data/<asset>/<time>")
def timereturn(asset, time):
    currentyear = str(datetime.now().year)
    asset = asset.lower()
    asset_price_name = asset + '_price'
    columns = ['date', asset_price_name]
    time_data = []
    for row in session.query(Crypto).add_columns(*columns):
        daily_data = {}
        daily_data['date'] = row[1]
        daily_data[asset_price_name] = (float(row[2]))
        time_data.append(daily_data)
    if time == 'onemo':
        return jsonify(time_data[-30:])
    elif time == 'threemo':
        return jsonify(time_data[-90:])
    elif time == 'oneyr':
        return jsonify(time_data[-730:])
    elif time == 'twoyr':
        return jsonify(time_data[-1095:])
    elif time == 'ytd':
        time_data = []
        for row in session.query(Crypto).add_columns(*columns).filter(Crypto.date > currentyear+'-01-01'):
            daily_data = {}
            daily_data['date'] = row[1]
            daily_data[asset_price_name] = (float(row[2]))
            time_data.append(daily_data)
        return jsonify(time_data)


@app.route("/data/<info>/<asset>/<time>")
def inforeturn(info, asset, time):
    currentyear = str(datetime.now().year)
    asset = asset.lower()
    info = info.lower()
    col_name = asset+'_'+info
    columns = ['date', col_name]
    info_data = []
    for row in session.query(Crypto).add_columns(*columns):
        daily_data = {}
        daily_data['date'] = row[1]
        daily_data[col_name] = (float(row[2]))
        info_data.append(daily_data)
    if time == 'onemo':
        return jsonify(info_data[-30:])
    elif time == 'threemo':
        return jsonify(info_data[-90:])
    elif time == 'oneyr':
        return jsonify(info_data[-730:])
    elif time == 'twoyr':
        return jsonify(info_data[-1095:])
    elif time == 'ytd':
        info_data = []
        for row in session.query(Crypto).add_columns(*columns).filter(Crypto.date > currentyear+'-01-01'):
            daily_data = {}
            daily_data['date'] = row[1]
            daily_data[col_name] = (float(row[2]))
            info_data.append(daily_data)
        return jsonify(info_data)
    




if __name__=="__main__":
    app.run(debug=True, use_reloader=False)
    #port = int(os.environ.get('PORT', 5000))
    #app.run(host = '0.0.0.0', port = port)

