function buildCharts(sampleData) {
    

    const dataBtc ={
        x: [],
        y: [],
        type: 'scatter',
        fill: 'tonexty'
    };

    const dataEth ={
        x: [],
        y: [],
        type: 'scatter',
        fill: 'tozeroy'
    }
    
    const dataEos ={
        x: [],
        y: [],
        type: 'scatter',
        fill: 'green'
    }

    var layout = {
        title: "Historical Prices of Cryptocurrencies"
    }


    sampleData.map(function(oneObj) {
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

function buildIndChart(sampleData, assestName) {
        const chartData ={
        x: [],
        y: [],
        type: 'scatter',
        mode: 'lines',
    };

    var layout = {
        title: "Historical Price",
        xaxis: {
            tickmode: 'auto',
            nticks: 20,
            showgrid: true
        }
        
    };

    var name = assestName + "_price";
    sampleData.map(function(oneObj) {
        var oldDate = oneObj.date
        var newDate = new Date(oldDate).toDateString();
        chartData.x.push(newDate);
        chartData.y.push(oneObj[name]);
    });
    //console.log(chartData);
    Plotly.newPlot('linechart',[chartData], layout);

}


//function optionChanged(asset) {
    //Plotly.d3.json(`/data/${asset}`, function(error, assetData){
       // buildIndChart(assetData, asset);

    //})
//}
function assetChange(asset) {
    Plotly.d3.json(`/data/${asset}`, function(error, assetData){
        buildIndChart(assetData, asset);
    })
}

function timeChange(time) {
    var temp = document.getElementById('selectAsset');
    var asset = temp.options[temp.selectedIndex].value;
    Plotly.d3.json(`/data/${asset}/${time}`, function(error, assetData){
        buildIndChart(assetData,asset);
    })
}



getData();