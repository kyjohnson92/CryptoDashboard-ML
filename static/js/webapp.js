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

function buildChart() {
    var dataObj = []
    selectedAssets.forEach(function(assetObject){
        var token = assetObject.token
        var data = assetObject.data
 
        var temp = document.getElementById('selectInfo')
    
        var infoName = temp.options[temp.selectedIndex].value;
        
            const dataAsset = {
                x: [],
                y: [],
                type: 'scatter',
                name: token.substring(0,3).toUpperCase()
            };
            data.forEach(function(oneObj) {
                var oldDate = oneObj.date*1000
                var newDate = new Date(oldDate).toDateString();
                dataAsset.x.push(newDate)
                dataAsset.y.push(oneObj.close)
                //dataAsset.name = (String(aname));
            })
            dataObj.push(dataAsset)
    

    })

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
        url: "/api/"+ asset +"/price(usd)/1438992000",
        dataType: 'json',
        success: function(jsonUSD) {
            jsonUSD = jsonUSD.result
            $.ajax({
                url:"https://poloniex.com/public?command=returnChartData&currencyPair="+coin + "&start=1367107200&end=1550934383&period=86400",
                dataType: 'json',
                success: function(jsonPairData) {
                    dailyData = []
                    jsonPairData.forEach(function(jsonPair, index) {
                        var low = jsonPair.low;
                        var high = jsonPair.high;
                        var open = jsonPair.open;
                        var close = jsonPair.close;
                        var volume = jsonPair.volume
                        if (jsonUSD[index]) {
                            var usd_price = jsonUSD[index][1]
    
                            var coinObj = {}
                            coinObj.date = jsonUSD[index][0]
                            if (asset == 'btc') {
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
                        }
                    })
                    buildChart(dailyData,asset);
                }
            })
        }    
    })
}

var selectedAssets = []

function isAssetSelected(assetName) {
    var found = false
    selectedAssets.map(function(asset) {
        if (asset.token == assetName) {
            found = true
            }
        })
        return found
    }

function removeAsset(assetName) {
    var assetRemoval;
    selectedAssets.map(function(asset,index) {
        if (asset.token == assetName) {
            assetRemoval = index
        }
    })
    selectedAssets.splice(assetRemoval,1)
}

function addAsset(assetName, assetData){
    selectedAssets.push({token:assetName,data:assetData})
}

function assetClicked(asset, event) {
    switch(chart) {
        case 'timeseries':
            if (isAssetSelected(asset)) {
                removeAsset(asset)
                toggleBtn(event.target)
                buildChart()
            }
            else{
                getApiData(asset).then(function(data){
                    addAsset(asset,data)
                    toggleBtn(event.target)
                    buildChart()
                })
            }
            break;
        case 'candlestick':
            buttonDeselect()
            getApiData(asset).then(function(data){
                buildCandleStick(data, asset)
                toggleBtn(event.target)
            })
            break;
    }
}

function getApiData(asset){
    return new Promise(function(resolve,reject){
    if (asset == 'btc') {
        var coin = 'BTC_ETH'
    }
    else{
        var coin = 'BTC_' + asset.toUpperCase();
    }
    
    var endDate = (Date.now()/1000)
    endDate = Math.floor(endDate)
    $.ajax({
        url: "/api/btc/price(usd)/1438992000",
        dataType: 'json',
        success: function(jsonUSD) {
            jsonUSD = jsonUSD.result
            $.ajax({
                url:"https://poloniex.com/public?command=returnChartData&currencyPair="+coin + "&start=1438992000&end=" + endDate + "&period=86400",
                dataType: 'json',
                success: function(jsonPairData) {
                    jsonUSDLength = jsonUSD.length
                    jsonPairDataLength = jsonPairData.length
                    if (jsonPairDataLength < jsonUSDLength) {
                        begin = jsonUSDLength - jsonPairDataLength
                        jsonUSD = jsonUSD.slice(begin)
                    }
                    dailyData = []
                    jsonPairData.forEach(function(jsonPair, index) {
                        var low = jsonPair.low;
                        var high = jsonPair.high;
                        var open = jsonPair.open;
                        var close = jsonPair.close;
                        var volume = jsonPair.volume
                        if (jsonUSD[index]) {
                            var usd_price = jsonUSD[index][1]
    
                            var coinObj = {}
                            coinObj.date = jsonUSD[index][0]
                            if (asset == 'btc') {
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
                        }
                    })
                    resolve(dailyData)
                }
            })
        }
    })
    })
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

var chart = 'timeseries';

function chartChange(chartName, event){
    $(".btn-chart").removeClass("active");
    $(event.target).addClass("active");
    chart= chartName
    if (chart =='candlestick'){
        buttonDeselect()
        $(".btn-asset[value='btc']").click()
    }
    else{
        $(".btn-asset").removeClass("active");
        $(".btn-asset[value='btc']").click()
    }
}

function buttonDeselect(){
    selectedAssets.length = 0
    $(".btn-asset").removeClass("active");
}

function buildCandleStick(data,assetName) {
    var dataObj = []
    var temp = document.getElementById('selectInfo')

    var infoName = temp.options[temp.selectedIndex].value;
    
        const dataAsset = {
            x: [],
            close: [],
            decreasing: {line: {color: '#7F7F7F'}}, 
            high: [],
            increasing: {line: {color: '#17BECF'}}, 
            line: {color: 'rgba(31,119,180,1)'}, 
            low: [],
            open: [],
            type: 'candlestick',
            xaxis: 'x',
            yaxis: 'y',
            name: ''
        };
        data.forEach(function(oneObj) {
            var oldDate = oneObj.date*1000
            var newDate = new Date(oldDate).toDateString();
            dataAsset.x.push(newDate)
            var aname = assetName + "_" + infoName
            console.log(aname)
            dataAsset.close.push(oneObj.close)
            dataAsset.high.push(oneObj.high)
            dataAsset.low.push(oneObj.low)
            dataAsset.open.push(oneObj.open)
            dataAsset.name = aname.substring(0,3).toUpperCase()
            //dataAsset.name = (String(aname));
        })
        dataObj.push(dataAsset)

    var layout = {
        title: "Cryptocurrency Historical Outlook",
        dragmode: 'zoom', 
        showlegend: false, 
        xaxis: {            
            tickmode: 'auto',
            nticks: 20,
            showgrid: true,
          
          title: 'Date'
        //   type: 'date'
        }, 
        yaxis: {
        
          type: 'linear'
        }
        
    }
    
    Plotly.newPlot('linechart',dataObj, layout);

}



getData();