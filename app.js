var alarm = {
  id: null,
  alarmTime: null,
  ref: {
    hr:       document.getElementById('hour'),
    min:      document.getElementById('minute'),
    sec:      document.getElementById('second'),
    location: document.getElementById('location'),
    current:  document.getElementById('current'),
    remain:   document.getElementById('remain'),
    btn:      document.getElementById('btn'),
    auto:     document.getElementById('auto')
  },

  init: function () {
    // 1. local storage (alarm_time, location, auto)
    var alarmTime = localStorage.getItem('alarm_time') || this.getCurrentTime();
    var location  = localStorage.getItem('location')   || 'http://';
    var auto      = localStorage.getItem('auto') === 'true';

    // 2. insert hour, minute, second options
    var t = alarmTime.split(':');   // ["21", "50", "28"]
    for (var i = 0; i < 60; i++) {
      var v = this.pad(i);  // "00" ~ "59"

      if (i < 24) {
        this.ref.hr[i] = new Option(v, v, false, v === t[0]);
      }
      this.ref.min[i] = new Option(v, v, false, v === t[1]);
      this.ref.sec[i] = new Option(v, v, false, v === t[2]);
    }

    // 3. setup location
    this.ref.location.value = location;

    // 4. setup button handler
    this.ref.btn.onclick = this.submit.bind(this);

    // 5. listen to keypress event
    document.onkeypress = function (e) {
      // Enter
      if (e.keyCode === 13) {
        this.submit();
      }
    }.bind(this);

    // 6. setup auto checkbox
    this.ref.auto.checked = auto;
    this.ref.auto.onchange = function (e) {
      localStorage.setItem('auto', e.target.checked);
    };
    if (auto === true) {
      this.submit();
    }

    // 7. start time ticker
    this.main();
    this.id = setInterval(this.main.bind(this), 100);   // update rate: 100ms
  },

  main: function () {
    var ct = this.getCurrentTime();
    var rt = this.getRemainTime();

    // update current and remain time
    this.ref.current.innerHTML = ct;
    this.ref.remain.innerHTML = rt;

    // time is up => change the location
    if (this.alarmTime === ct) {
      clearInterval(this.id);
      this.id = null;

      window.location = this.ref.location.value;
    }
  },

  submit: function() {
    var at = null;
    if (this.alarmTime === null) {
      at = [this.ref.hr.value, this.ref.min.value, this.ref.sec.value].join(':');

      localStorage.setItem('alarm_time', at);
      localStorage.setItem('location', this.ref.location.value);
    }

    this.alarmTime             = at;
    this.ref.hr.disabled       = at !== null;
    this.ref.min.disabled      = at !== null;
    this.ref.sec.disabled      = at !== null;
    this.ref.location.disabled = at !== null;
    this.ref.btn.innerHTML     = at !== null ? 'stop' : 'start';
    this.ref.remain.innerHTML  = this.getRemainTime();
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

  getRemainTime: function () {
    if (this.alarmTime === null) {
      return '';
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
    return [pad(h), pad(m), pad(s)].join(':');
  }
};

// init
alarm.init();
