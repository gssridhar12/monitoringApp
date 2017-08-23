$( document ).ready(function() {
  var sensornames = [];
  var socket = io('http://interview.optumsoft.com');

  socket.emit("subscribe", "temperature1");

  socket.on('data', function (data) {
    // console.log(data);
  });

  $.get( "http://interview.optumsoft.com/sensornames", function( data ) {
    // console.log( "Data Loaded: " + data );
    this.sensornames = data;
    for (var i = 0; i < this.sensornames.length; i++) {
      $('<input />', {
        type : 'checkbox',
        id: 'chk'+this.sensornames[i],
        value:  this.sensornames[i],
        style: 'margin-top:7px; margin-left:5px'
      })
      .appendTo("div.sensorDiv");
      $( "div.sensorDiv" ).append('<label for="lbl'+this.sensornames[i]+'">'+this.sensornames[i]+'</label>');
      $('input#chk'+this.sensornames[i]+':checkbox').change(
        function(){
          console.log(this.value);
        });
      }


    });

    $.get( "http://interview.optumsoft.com/config", function( data ) {
      console.log( "Data Loaded: " + data );
    });

    var ctx = document.getElementById("myChart").getContext('2d');
    var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
          label: "My First dataset",
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0, 10, 5, 2, 20, 30, 45],
        }]
      },

      // Configuration options go here
      options: {}
    });
  });
