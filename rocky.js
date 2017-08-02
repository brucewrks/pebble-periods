var rocky = require('rocky');
var schedule = [];

var current = {
  hours: 12,
  minutes: 0,
  weekday: '',
  day: 0,
  month: '',
  task: 'None',
  minsToTask: 999
};

rocky.on('draw', function(event) {
  var ctx = event.context;
  var d = new Date();

  // Clear the screen
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

  // Determine the width and height of the display
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;

  // Determine the center point of the display
  // and the max size of watch hands
  var cx = w / 2;
  var cy = h / 2;

  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.font      = '28px bold Gothic';
  ctx.fillText(current.hours.toString() + ':' + current.minutes.toString(), cx, 25, (w - 20));

  ctx.font      = '18px Gothic';
  ctx.fillText(dayOfWeek(current.weekday) + ' ' + month(current.month) + ' ' + current.day, cx, 55, (w - 20));
  ctx.fillText(current.task, cx, 95, (w - 20));

  console.log(schedule[0].name);
});

// Convers hours + minutes into minutes in a day
var convertToMinutes = function(hour, minute) {
  var minutes = 0;

  minutes = hour * 60;
  minutes = minutes + minute;
};

// Converts minute integer to Hours String
// IE if minutes = 65 return `1 hour 5 minutes`
var convertToHours = function(minute) {
  if(minute % 60 === 0) {
    var hours = (minute / 60);
    if(hours === 1) return '1 hour';
    else return hours.toString() + ' hours';
  }

  var hours = Math.round(minute / 60);
  var minutes = minute - (hours * 60);

  if(hours === 1 && minutes === 1) {
    return '1 hour 1 min';
  } else if (hours === 1) {
    return '1 hour ' + minutes.toString() + ' mins'
  } else if (minutes === 1) {
    return hours.toString() + ' hours 1 mins'
  } else {
    return hours.toString() + ' hours ' + minutes.toString() + ' mins';
  }
};

var dayOfWeek = function(int) {
  var weekday = new Array(7);
  weekday[0] =  "Sun";
  weekday[1] = "Mon";
  weekday[2] = "Tue";
  weekday[3] = "Wed";
  weekday[4] = "Thu";
  weekday[5] = "Fri";
  weekday[6] = "Sat";

  return weekday[int];
};

var month = function(int) {
  var month = new Array();
  month[0] = "Jan";
  month[1] = "Feb";
  month[2] = "Mar";
  month[3] = "Apr";
  month[4] = "May";
  month[5] = "Jun";
  month[6] = "Jul";
  month[7] = "Aug";
  month[8] = "Sep";
  month[9] = "Oct";
  month[10] = "Nov";
  month[11] = "Dec";

  return month[int];
}

rocky.on('minutechange', function(event) {
  var d = new Date();
  var day = d.getDay();

  current.hours = d.getHours();
  current.minutes = d.getMinutes();
  current.weekend = (day === 0 || day === 6) ? true : false;
  current.weekday = d.getDay();
  current.day     = d.getDate();
  current.month   = d.getMonth();

  var theCurrentMinutes = convertToMinutes(current.hours, current.minutes);
  var smallestMinutes = 60 * 6;
  var theEvent = '';

  schedule.forEach(function(ev) {
    if(current.weekend && !ev.on_weekend) return; // Don't count it if it's on the weekend

    var startMinutes = convertToMinutes(ev.start.hour, ev.start.minute) - theCurrentMinutes;
    var endMinutes = convertToMinutes(ev.end.hour, ev.end.minute) - theCurrentMinutes;

    if(startMinutes > 0 && startMinutes < smallestMinutes) { // Event match is a start of period
      smallestMinutes = startMinutes;
      theEvent = ev.start.name + ' begins in ' + convertToHours(startMinutes);
    } else if(endMinutes > 0 && endMinutes < smallestMinutes) { // Event match is an end of period
      smallestMinutes = endMinutes;
      theEvent = ev.start.name + ' ends in ' + convertToHours(endMinutes);
    }
  });

  if(!theEvent || smallestMinutes > 60 * 6) { // No events retrieved?
    theEvent = 'You\'re all done for now! :-)';
  }

  current.task = theEvent;
  current.minsToTask = smallestMinutes;

  rocky.requestDraw();
});

rocky.on('message', function(event) {
  var message = event.data;

  if (message.schedule) {
    schedule = message.schedule;
    rocky.requestDraw();
  } else console.error('Failed to retrieve schedule!');
});

var getSchedule = function() {
  rocky.postMessage({'fetch': true});
};

rocky.on('hourchange', getSchedule);
getSchedule();
