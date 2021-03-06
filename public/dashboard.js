const LINE_CHART = $("#lineChart");
const DOUGHNUT_CHART = $("#doughnutChart");

Chart.defaults.global.animation.duration = 2500;

/* =========================== GET REQUEST FOR DREAMS + GRAPH DISPLAY ===========================*/

function getDreamEntries(callbackFn) {
  $.ajax({
    url: "/dreams/json",
    async: true,
    type: 'GET',
    dataType: 'json',

    success: function(data) {
      dateArray = [];
      hoursArray = [];
      dreamTypeArray = [];

      let normalCounter = 0;
      let lucidCounter = 0;
      let nightmareCounter = 0;
      let recurringCounter = 0;
      let doubleCounter = 0;

      if(data) {
        for (let i = 0; i < data.length; i++) {
          dateArray.unshift(data[i].created);
          hoursArray.unshift(data[i].hoursSlept);

          if (data.length > 30) {
            dateArray = dateArray.slice(-30);
            hoursArray = hoursArray.slice(-30);
          }

          if (data[i].type === 'Normal') {
            normalCounter++;
          }
          else if (data[i].type === 'Lucid') {
            lucidCounter++;
          }
          else if (data[i].type === 'Nightmare') {
            nightmareCounter++;
          }
          else if (data[i].type === 'Recurring') {
            recurringCounter++;
          }
          else if (data[i].type === 'Double') {
            doubleCounter++;
          }
        }

        dreamTypeArray.push(normalCounter);
        dreamTypeArray.push(lucidCounter);
        dreamTypeArray.push(nightmareCounter);
        dreamTypeArray.push(recurringCounter);
        dreamTypeArray.push(doubleCounter);

        let dreamChart = new Chart(DOUGHNUT_CHART, {
          type: 'doughnut',
          data: {
            labels: ['Normal', 'Lucid', 'Nightmare', 'Recurring', 'Double'],
            datasets:[
              {
                label: 'Points',
                backgroundColor: ['#82d1ff', '#ff7aa4', '#c1ea70', '#fffc7a', '#c18eff'],
                data: dreamTypeArray
              }
            ]
          },
          options:{
            animation: {
              animateScale: true
            }
          }
        });

/* ========================= SCROLLBAR DETECTION FOR GRAPH ANIMATION TIMING ===========================*/

        if ($("body").height() > $(window).height()) { //http://stackoverflow.com/questions/2146874/detect-if-a-page-has-a-vertical-scrollbar
          function checkVisible( elm, eval ) {
            eval = eval || "object visible";
            var viewportHeight = $(window).height(), // Viewport Height
            scrolltop = $(window).scrollTop(), // Scroll Top
            y = $(elm).offset().top,
            elementHeight = $(elm).height();

          if (eval == "object visible") return ((y < (viewportHeight + scrolltop)) && (y > (scrolltop - elementHeight)));
          if (eval == "above") return ((y < (viewportHeight + scrolltop)));
          }

/* ================================= LIMIT ANIMATION TO ONCE =================================*/

          $(window).on('scroll',function() { //http://stackoverflow.com/questions/32134451/call-function-on-scroll-only-once
            if (checkVisible($('#lineChart'))) {
              let sleepChart = new Chart(LINE_CHART, {
                type: 'line',
                data: {
                  labels: dateArray,
                  datasets: [
                    {
                      label: "Hours Slept",
                      fill: true,
                      lineTension: 0,
                      backgroundColor: "rgba(130,209,255,0.4)",
                      borderColor: "rgba(75,192,192,1)",
                      borderCapStyle: 'butt',
                      borderDash: [],
                      borderDashOffset: 0.0,
                      borderJoinStyle: 'miter',
                      pointBorderColor: "rgba(75,192,192,1)",
                      pointBackgroundColor: "#fff",
                      pointBorderWidth: 3,
                      pointHoverRadius: 5,
                      pointHoverBackgroundColor: "rgba(75,192,192,1)",
                      pointHoverBorderColor: "rgba(220,220,220,1)",
                      pointHoverBorderWidth: 3,
                      pointRadius: 5,
                      pointHitRadius: 10,
                      data: hoursArray,
                      spanGaps: false,
                    }
                  ]
                },
                options: {
                  scales: {
                    yAxes: [{
                      ticks: {
                        beginAtZero: true
                      }
                    }]
                  }
                }
              });
              $(window).off('scroll');
            }
          });
        }
        else {
          let sleepChart = new Chart(LINE_CHART, {
            type: 'line',
            data: {
              labels: dateArray,
              datasets: [
                {
                  label: "Hours Slept",
                  fill: true,
                  lineTension: 0,
                  backgroundColor: "rgba(75,192,192,0.4)",
                  borderColor: "rgba(75,192,192,1)",
                  borderCapStyle: 'butt',
                  borderDash: [],
                  borderDashOffset: 0.0,
                  borderJoinStyle: 'miter',
                  pointBorderColor: "rgba(75,192,192,1)",
                  pointBackgroundColor: "#fff",
                  pointBorderWidth: 3,
                  pointHoverRadius: 5,
                  pointHoverBackgroundColor: "rgba(75,192,192,1)",
                  pointHoverBorderColor: "rgba(220,220,220,1)",
                  pointHoverBorderWidth: 3,
                  pointRadius: 5,
                  pointHitRadius: 10,
                  data: hoursArray,
                  spanGaps: false,
                }
              ]
            },
            options: {
              scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
                }]
              }
            }
          });
        }

        callbackFn(data)

      } // if statement close
    } // success function close
  });
}

/* ================================= USER STATS LOGIC AND DISPLAY =================================*/

function displayUserStats(data) {
  let lucidDreamPct;
  if (data.length === 0) {
    lucidDreamPct = 0 + '%';
  }
  else {
    lucidDreamPct = (dreamTypeArray[1] / dreamTypeArray.reduce((a, b) => {
      return a + b;
    }, 0)).toFixed(2) * 100 + '%';
  }

  let sleepTotal = hoursArray.reduce((a, b) => {
    return a + b;
  }, 0);

  let sleepAvg;
  if (sleepTotal === 0) {
    sleepAvg = 0;
  }
  else {
    sleepAvg = (sleepTotal / data.length).toFixed(2);
  }

  let dreamsRecordedDisplay = '<p class="stat">'+ data.length +'</p>';
  let lucidDreamDisplay = '<p class="stat">' + lucidDreamPct + '</p>';
  let sleepAvgDisplay = '<p class="stat">' + sleepAvg + '</p>';
  let totalHoursDisplay = '<p class="stat">' + sleepTotal + '</p>';

  $('.tracked-dreams').html(dreamsRecordedDisplay);
  $('.lucid-dream-pct').html(lucidDreamDisplay)
  $('.avg-sleep').html(sleepAvgDisplay);
  $('.total-hours').html(totalHoursDisplay)
}

/* ================================= IIFE FOR PAGE =================================*/

$(function() {
  getDreamEntries(displayUserStats);
});

/* ================================= RESPONSIVE NAVIGATION =================================*/

$('.handle').on('click', function(event) {
  $('nav ul').toggleClass('showing');
});