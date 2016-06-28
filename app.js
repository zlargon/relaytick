var alarm = {
  id: null,
  alarmTime: null,
  ref: {
    hr: null,
    min: null,
    sec: null,
    location: null,
    current: null,
    remain: null,
    btn: null
  },

  init: function () {
    // 1. local storage (alarm_time, location)
    var alarmTime = localStorage.getItem('alarm_time') || this.getCurrentTime();
    var location  = localStorage.getItem('location')   || 'http://';

    // 2. setup DOM reference
    this.ref.hr       = document.getElementById("hour");
    this.ref.min      = document.getElementById("minute");
    this.ref.sec      = document.getElementById("second");
    this.ref.location = document.getElementById("location");
    this.ref.current  = document.getElementById("current");
    this.ref.remain   = document.getElementById("remain");
    this.ref.btn      = document.getElementById("btn");

    // 3. insert hour, minute, second options
    var t = alarmTime.split(':');   // ["21", "50", "28"]
    for (var i = 0; i < 60; i++) {
      var v = this.pad(i);  // "00" ~ "59"

      if (i < 24) {
        this.ref.hr[i] = new Option(v, v, false, v === t[0]);
      }
      this.ref.min[i] = new Option(v, v, false, v === t[1]);
      this.ref.sec[i] = new Option(v, v, false, v === t[2]);
    }

    // 4. setup location
    this.ref.location.value = location;

    // 5. setup btn handler
    this.ref.btn.onclick = this.btnHander.bind(this);

    // 6. listen to keypress event
    document.onkeypress = function (e) {
      // Enter
      if (e.keyCode === 13) {
        this.btnHander();
      }
    }.bind(this);

    // 7. start alarm (update rate: 500ms)
    this.start(500);
  },

  start: function (timeval) {
    this.main();
    this.id = setInterval(this.main.bind(this), timeval);
  },

  stop: function () {
    clearInterval(this.id);
    this.id = null;
  },

  main: function () {
    var ct = this.getCurrentTime();
    this.ref.current.innerHTML = ct;  // update current time

    // update remain time
    this.updateRemainTime();

    // if time's up
    if (this.alarmTime === ct) {
      this.stop();
      window.location = this.ref.location.value;
    }
  },

  btnHander: function() {
    if (this.alarmTime === null) {
      this.setup();
      this.ref.btn.innerHTML = 'stop';
    } else {
      this.reset();
      this.ref.btn.innerHTML = 'start';
    }
  },

  setup: function () {
    this.alarmTime = [this.ref.hr.value, this.ref.min.value, this.ref.sec.value].join(':');

    // local storage
    localStorage.setItem('alarm_time', this.alarmTime);
    localStorage.setItem('location', this.ref.location.value);

    // disable
    this.ref.hr.disabled = true;
    this.ref.min.disabled = true;
    this.ref.sec.disabled = true;
    this.ref.location.disabled = true;

    // update remain time
    this.updateRemainTime();
  },

  reset: function () {
    this.alarmTime = null;
    this.ref.hr.disabled = false;
    this.ref.min.disabled = false;
    this.ref.sec.disabled = false;
    this.ref.location.disabled = false;
    this.ref.remain.innerHTML = '';
  },

  pad: function (n) {
    return (n < 10 ? '0' : '') + n; // "00" ~ "09"
  },

  getCurrentTime: function () {
    var t = new Date();
    var pad = this.pad;

    return [
      pad(t.getHours()),
      pad(t.getMinutes()),
      pad(t.getSeconds())
    ].join(':');
  },

  updateRemainTime: function () {
    if (this.alarmTime === null) {
      this.ref.remain.innerHTML = '';
      return;
    }

    var ct = new Date();
    var at = this.alarmTime.split(':');

    var h = Number.parseInt(at[0]) - ct.getHours();
    var m = Number.parseInt(at[1]) - ct.getMinutes();
    var s = Number.parseInt(at[2]) - ct.getSeconds();

    if (s < 0) { s += 60; m -= 1; }
    if (m < 0) { m += 60; h -= 1; }
    if (h < 0) { h += 24; }

    var pad = this.pad;
    this.ref.remain.innerHTML = [pad(h), pad(m), pad(s)].join(':');
  }
};

// init
alarm.init();
