function buildCharts(sampleData) {
    

    const dataBtc ={
        x: [],
        y: [],
        type: 'scatter',
        fill: 'tonexty',
        name: 'BTC'
    };

    const dataEth ={
        x: [],
        y: [],
        type: 'scatter',
        fill: 'tozeroy',
        name: 'ETH'
    }
    
    const dataEos ={
        x: [],
        y: [],
        type: 'scatter',
        fill: 'green',
        name: 'EOS'
    }

   var layout = {
        title: "Cryptocurrency Historical Outlook",
        xaxis: {
            title: 'Date',
            tickmode: 'auto',
            nticks: 20,
            showgrid: false
        },
        yaxis:{
            title: "USD"
        }
        
    }
    sampleData.forEach(function(oneObj) {
        var oldDate = oneObj.date
        var newDate = new Date(oldDate).toDateString();
        dataBtc.x.push(newDate)
        dataBtc.y.push(oneObj.btc_price);
        dataEth.x.push(newDate)
        dataEth.y.push(oneObj.eth_price);
        dataEos.x.push(newDate)
        dataEos.y.push(oneObj.eos_price);
    });

    dataObj = [dataBtc, dataEth, dataEos]
    Plotly.newPlot('linechart',dataObj, layout);
}

function getData(data) {
    Plotly.d3.json(`/data`, function(error, sampledata) {
        if (error) return console.warn(error);
        buildCharts(sampledata);
    })
}

function buildChart(data,assetNames) {
    var dataObj = []
    var temp = document.getElementById('selectInfo')

    var infoName = temp.options[temp.selectedIndex].value;
    data.forEach(function(sampleData,index){
        const dataAsset = {
            x: [],
            y: [],
            type: 'scatter',
            name: ''
        };
        sampleData.forEach(function(oneObj) {
            var oldDate = oneObj.date
            var newDate = new Date(oldDate).toDateString();
            dataAsset.x.push(newDate)
            var aname = assetNames[index]+ "_" + infoName
            console.log(aname)
            dataAsset.y.push(oneObj[aname])
            dataAsset.name = aname.substring(0,3).toUpperCase()
            //dataAsset.name = (String(aname));
        })
        dataObj.push(dataAsset)
    });

    var layout = {
        title: "Cryptocurrency Historical Outlook",
        xaxis: {
            title: 'Date',
            tickmode: 'auto',
            nticks: 20,
            showgrid: true
        },
        yaxis:{
            title: "USD"
        }
        
    }
    
    Plotly.newPlot('linechart',dataObj, layout);

}

function optionChanged(info,time='twoyr') {
    var assetSelected = buttonTracker()
    var apiData = []
    var numAssets = assetSelected.length
     assetSelected.forEach(function(element,index) {
        Plotly.d3.json(`/data/${info}/${element}/${time}`, function(error, assetData){
            apiData.push(assetData)
            if(index+1 == numAssets) {
                buildChart(apiData, assetSelected)
            }
        });
     })
}

function buttonTracker() {
    var selectedButtons = Array.from(document.getElementsByClassName('btn btn-default active'))
    return selectedButtons.map(function(oneObj){
        return oneObj.value
    })
}


function assetChange(asset, event) {
    if (asset == 'btc') {
        var coin = 'BTC_ETH'
    }
    else{
        var coin = 'BTC_' + asset.toUpperCase();
    }
    
    var endDate = (Date.now()/1000)
    endDate = Math.floor(endDate)
    $.ajax({

        url: "/usd/"+endDate,
        dataType: 'json',
        success: function(jsonUSD) {
            $.ajax({
                url:"https://poloniex.com/public?command=returnChartData&currencyPair="+coin + "&start=1367107200&end=" + endDate + "&period=86400",
                dataType: 'json',
                success: function(jsonPairData) {
                    dailyData = []
                    jsonPairData.forEach(function(jsonPair, index) {
                        var low = jsonPair.low;
                        var high = jsonPair.high;
                        var open = jsonPair.open;
                        var close = jsonPair.close;
                        var volume = jsonPair.volume
                        
                        var usd_price = jsonUSD[index].value
                        console.log(usd_price)
                        var coinObj = {}
                        if (asset = 'btc') {
                        coinObj.low = (usd_price * close)/low;
                        coinObj.high = (usd_price * close)/high;
                        coinObj.open = (usd_price * close)/open;
                        coinObj.close = usd_price;
                        coinObj.volume = volume
                        }
                        else{
                            coinObj.low = low * usd_price;
                            coinObj.high = high * usd_price;
                            coinObj.open = open * usd_price;
                            coinObj.close = close * usd_price;
                            coinObj.volume = volume
                        }
                        dailyData.push(coinObj)

                    })
                console.log(jsonUSD)
                }
            })
        }    
    })
}


function assetChange2(asset, event) {
    toggleBtn(event.target)
    var temp = document.getElementById('selectInfo');
    var info = temp.options[temp.selectedIndex].value;
    optionChanged(info)

}

function timeChange(time) {
    var temp = document.getElementById('selectInfo');
    var asset = temp.options[temp.selectedIndex].value;
    optionChanged(asset,time)
}

function toggleBtn(clickedButton) { 
    var isActive = clickedButton.classList.contains('active');
    if (!isActive) {
        clickedButton.classList.add('active')
    }
    else {
        clickedButton.classList.remove('active')
    };
}

getData();