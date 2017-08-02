var scheduleURL = 'https://raw.githubusercontent.com/brucewsinc/pebble-periods/master/schedule.json';

Pebble.on('message', function(event) {
  var message = event.data;

  if(message.fetch) {
    // Re-request schedule
    request(scheduleURL, 'GET', function(json) {
      schedule = JSON.parse(json);
      Pebble.postMessage({'schedule': schedule});
    });
  }
});

function request(url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function (e) { callback(this.responseText); };
  xhr.open(type, url);
  xhr.send();
}
