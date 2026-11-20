$(function () {
  var KEY = 'aptComplaints', data = [];

  // ---- "Database" layer (localStorage; swap with $.ajax to a backend later) ----
  function load() {
    try { data = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { data = null; }
    if (!data) {
      data = [
        {id:1, name:'Ravi Kumar', flat:'A-101', cat:'Plumbing', pri:'High', desc:'Water leakage from bathroom ceiling.', status:'In Progress', date:'2026-11-17'},
        {id:2, name:'Anita Rao', flat:'B-204', cat:'Lift', pri:'Medium', desc:'Lift in Block B stops at 3rd floor.', status:'Pending', date:'2026-11-19'}
      ];
      save();
    }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }

  var esc = function (s) { return $('<div>').text(s).html(); };
  var cls = function (s) { return s === 'In Progress' ? 'Progress' : s; };

  function card(c, admin) {
    var h = '<div class="item"><div class="top"><span>#' + c.id + ' · ' + esc(c.cat) + ' <small>(' + c.pri + ')</small></span>' +
      '<span class="badge ' + cls(c.status) + '">' + c.status + '</span></div>' +
      '<div class="meta">' + esc(c.name) + ' · Flat ' + esc(c.flat) + ' · ' + c.date + '</div>' +
      '<div>' + esc(c.desc) + '</div>';
    if (admin) {
      h += '<div class="actions"><select class="st" data-id="' + c.id + '">';
      ['Pending', 'In Progress', 'Resolved'].forEach(function (s) {
        h += '<option' + (s === c.status ? ' selected' : '') + '>' + s + '</option>';
      });
      h += '</select><button class="btn sm red del" data-id="' + c.id + '">Delete</button></div>';
    }
    return h + '</div>';
  }

  // ---- Renderers ----
  function renderMine() {
    var f = $.trim($('#myFlat').val()).toLowerCase();
    if (!f) { $('#myList').html('<div class="empty">Enter your flat number to see your complaints.</div>'); return; }
    var list = data.filter(function (c) { return c.flat.toLowerCase() === f; });
    $('#myList').html(list.length ? list.slice().reverse().map(function (c) { return card(c, false); }).join('') : '<div class="empty">No complaints found.</div>');
  }

  function renderAdmin() {
    var q = $('#q').val().toLowerCase(), s = $('#fStatus').val(), k = $('#fCat').val();
    var list = data.filter(function (c) {
      return (!s || c.status === s) && (!k || c.cat === k) &&
        (c.name + c.flat + c.desc).toLowerCase().indexOf(q) > -1;
    });
    $('#admList').html(list.length ? list.slice().reverse().map(function (c) { return card(c, true); }).join('') : '<div class="empty">No complaints match.</div>');
    $('#sTotal').text(data.length);
    $('#sPending').text(data.filter(function (c) { return c.status === 'Pending'; }).length);
    $('#sProg').text(data.filter(function (c) { return c.status === 'In Progress'; }).length);
    $('#sRes').text(data.filter(function (c) { return c.status === 'Resolved'; }).length);
  }

  // ---- Events ----
  $('#tabRes').click(function () { $(this).addClass('on'); $('#tabAdm').removeClass('on'); $('#resView').show(); $('#admView').hide(); renderMine(); });
  $('#tabAdm').click(function () { $(this).addClass('on'); $('#tabRes').removeClass('on'); $('#admView').show(); $('#resView').hide(); });

  $('#submit').click(function () {
    var name = $.trim($('#name').val()), flat = $.trim($('#flat').val()), desc = $.trim($('#desc').val());
    if (!name || !flat || desc.length < 10) { alert('Please fill name, flat no. and a description (min 10 characters).'); return; }
    var id = data.length ? Math.max.apply(null, data.map(function (c) { return c.id; })) + 1 : 1;
    data.push({id: id, name: name, flat: flat, cat: $('#cat').val(), pri: $('#pri').val(), desc: desc, status: 'Pending', date: new Date().toISOString().slice(0, 10)});
    save();
    $('#ok').text('Complaint #' + id + ' submitted successfully!').fadeIn().delay(2500).fadeOut();
    $('#myFlat').val(flat); $('#desc').val('');
    renderMine(); renderAdmin();
  });

  $('#myFlat').on('input', renderMine);
  $('#q, #fStatus, #fCat').on('input change', renderAdmin);

  $('#loginBtn').click(function () {
    if ($('#pin').val() === '1234') { $('#login').hide(); $('#panel').show(); renderAdmin(); }
    else { $('#bad').fadeIn().delay(1500).fadeOut(); }
  });

  // delegated events for dynamically created elements
  $('#admList').on('change', '.st', function () {
    var id = +$(this).data('id');
    data.forEach(function (c) { if (c.id === id) c.status = $(this).val(); }, this);
    save(); renderAdmin();
  });
  $('#admList').on('click', '.del', function () {
    var id = +$(this).data('id');
    if (confirm('Delete complaint #' + id + '?')) {
      data = data.filter(function (c) { return c.id !== id; });
      save(); renderAdmin();
    }
  });

  load(); renderMine(); renderAdmin();
});
