endpoint = 'live'
access_key = '9c3edf8886abf1d05467666bf0e79ce4';


    $.ajax({
        url: 'http://api.coinlayer.com/api/' + endpoint + '?access_key=' + access_key,   
        dataType: 'jsonp',
        success: function(json) {

            // exchange rata data is stored in json.rates
            var priceList = {
                btc : json.rates.BTC,
                eth : json.rates.ETH,
                eos : json.rates.EOS,
                xrp : json.rates.XRP,
                ltc : json.rates.LTC,
                xlm : json.rates.XLM,
                dash: json.rates.DASH
            };

            Object.keys(priceList).forEach(function(key) {
                $('#'+key+'-price').text('$' + priceList[key].toFixed(2));
 

            });
        }
    });


    $.ajax({
        url: "https://poloniex.com/public?command=returnTicker",
        dataType: 'json',
        success: function(json) {
            var token = {
                btc: +json['USDT_BTC'].percentChange,
                eth: +json['USDT_ETH'].percentChange,
                eos: +json['USDT_EOS'].percentChange,
                ltc: +json['USDT_LTC'].percentChange,
                xrp: +json['USDT_XRP'].percentChange,
                xlm: +json['USDT_STR'].percentChange,
                dash: +json['USDT_DASH'].percentChange
            };
            
            Object.keys(token).forEach(function(key) {
                $('#'+key+'-change').text((token[key]*100).toFixed(2)+"%");

                if(token[key] > 0){
                    $('#'+key+'-change').addClass('positive-change')
                }
                else{
                    $('#'+key+'-change').addClass('negative-change')
                }
            });    
        }
    });