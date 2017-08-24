$( document ).ready(function() {
  var sensornames = [];
  var sensorConfig = {};
  var socket = io('http://interview.optumsoft.com');
  var ctx = document.getElementById("myChart").getContext('2d');
  var pointBackgroundColors = [];

  //using chart.js for graphs.
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    //to be set dynamically
    data: {},

    // Configuration options go here
    options: {
      responsive: true,
      title:{
        display:true,
        text:'Temperature Monitoring Line Chart'
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      }
    }
  });

  socket.on('data', function (data) {
    if (data.type === "init"){
      createChart();
    }else if (data.type === "update"){
      updateChart(data);
    }else if (data.type === "delete"){
      deleteFromChart(data);
    }
  });

  $.get( "http://interview.optumsoft.com/config", function( data ) {
    //for min max values
    sensorConfig = data;
  });

  $.get( "http://interview.optumsoft.com/sensornames", function( data ) {
    sensornames = data;

    //creating radio dynamically based on sensor names received
    for (var i = 0; i < sensornames.length; i++) {
      $('<input />', {
        type : 'radio',
        name : 'radioSensors',
        id: 'rad'+sensornames[i],
        value:  sensornames[i],
        style: 'margin-top:7px; margin-left:5px'
      })
      .appendTo("div.sensorDiv");
      $( "div.sensorDiv" ).append('<label for="lbl'+sensornames[i]+'">'+sensornames[i]+'</label>');

      //adding event listeners for radio buttons
      $('input#rad'+sensornames[i]).change(
        function(){
          if(this.checked){
            pointBackgroundColors = [];
            socket.emit("subscribe", this.value);
            for (var i = 0; i < sensornames.length; i++) {
              if(sensornames[i]!=this.value){
                socket.emit("unsubscribe", sensornames[i]);
              }
            }
          }});
        }
      });

      var createChart = function () {
        var val = $('input[name=radioSensors]:checked').val();
        var newDataset = {
          label: val,
          type: 'bar',
          backgroundColor: pointBackgroundColors,
          data: [],
          fill: false
        };
        var minDataset = {
          label: 'min-'+val,
          type: 'line',
          backgroundColor: "#158078",
          borderColor: "#158078",
          data: [],
          fill: false
        };
        var maxDataset = {
          label: 'max-'+val,
          type: 'line',
          backgroundColor: "#FFFF66",
          borderColor: "#FFFF66",
          data: [],
          fill: false
        };
        chart.data.datasets = [];
        chart.data.labels = [];
        chart.data.datasets.push(newDataset);
        chart.data.datasets.push(minDataset);
        chart.data.datasets.push(maxDataset);
        chart.update();
      }
      var updateChart = function(data){
        var val = $('input[name=radioSensors]:checked').val();
        var scale = $('.scale').find(":selected").text();
        if (scale === data.scale){
          chart.data.datasets.forEach((dataset) => {
            if(dataset.label.indexOf("min")> -1){
              dataset.data.push(sensorConfig[val].min);
            }else if(dataset.label.indexOf("max") > -1){
              dataset.data.push(sensorConfig[val].max);
            }
            else{
              dataset.data.push(data.val);
              if (data.val > sensorConfig[val].max || data.val < sensorConfig[val].min) {

                pointBackgroundColors.push("#CB4154");
              }
              else{
                pointBackgroundColors.push("#1974D2");
              }
            }

          });
          chart.data.labels.push(data.key);
          chart.update();
        }
      }
      var deleteFromChart = function(data){
        var scale = $('.scale').find(":selected").text();
        if (scale === data.scale){
          var key = chart.data.labels.indexOf(data.key);
          if(key > -1){
            chart.data.labels.splice(key, 1);
            chart.data.datasets.forEach((dataset) => {
              dataset.data.splice(key, 1);
              if(dataset.label.indexOf("min") == -1 && dataset.label.indexOf("max") == -1){
                pointBackgroundColors.splice(key, 1);
              }
            });
          }

          chart.update();
        }
      }

    });
