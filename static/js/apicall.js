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
                eos : json.rates.EOS
            };

            Object.keys(priceList).forEach(function(key) {
                $('#'+key+'-price').text('$' + priceList[key].toFixed(2));
 

            });
        }
    });

