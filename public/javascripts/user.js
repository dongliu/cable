$(function(){
  var users = [];
  var nameCache = {};
  var userTable = $('#users').dataTable({
    'aaData': users,
    'aoColumns': [{
        'sTitle': 'ID'
      }, {
        'sTitle': 'Full name'
      }, {
        'sTitle': 'Privileges'
      }
    ],
    'aaSorting': [
      [1, 'desc']
    ],
    "sDom": "<'row-fluid'<'span6'T><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
    "oTableTools": {
      "sSwfPath": "datatables/swf/copy_csv_xls_pdf.swf",
      "aButtons": [
          "copy",
          "print", {
          "sExtends": "collection",
          "sButtonText": 'Save <span class="caret" />',
          "aButtons": ["csv", "xls", "pdf"]
        }
      ]
    }
  });

  $.ajax({
    url: '/users/json',
    type: 'GET',
    dataType: 'json'
  }).done(function(json) {
    saved = json.map(function(request) {
      return [].concat(request.createdBy).concat(moment(request.createdOn).format('YYYY-MM-DD HH:mm:ss')).concat(request.basic.system).concat(request.basic.subsystem).concat(request.basic.signal).concat(request.updatedBy? request.updatedBy : '').concat(request.updatedOn? moment(request.updatedOn).format('YYYY-MM-DD HH:mm:ss') : '' ).concat(request._id);
    });
    savedTable.fnClearTable();
    savedTable.fnAddData(saved);
    savedTable.fnDraw();
    addClick($('#saved-table'), savedTable, 7);
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
  }).always();


  $('#name').autocomplete({
    minLength: 1,
    source: function(req, res) {
      var term = req.term.toLowerCase();
      var output = [];
      var key = term.charAt(0);
      if (key in nameCache) {
        for (var i = 0; i < nameCache[key].length; i += 1) {
          if (nameCache[key][i].toLowerCase().indexOf(term) === 0) {
            output.push(nameCache[key][i]);
          }
        }
        res(output);
        return;
      }
      $.getJSON('/username', req, function(data, status, xhr) {
        var names = [];
        for (var i = 0; i < data.length; i += 1) {
          if (data[i].displayName.indexOf(',') !== -1) {
            names.push(data[i].displayName);
          }
        }
        nameCache[term] = names;
        res(names);
      });
    },
    select: function(event, ui) {
      $('#name').val(ui.item.value);
    }
  });

  var validation = [
    // ['#adjust, #approve, #install, #qa, #admin', 'one-of', 'Need to select at least one privilege'],
    ['#name', 'presence', 'Please input a name']
  ];

  $('form[name="user"]').nod(validation);

  $('#change').click(function(e){
    if (Nod.formIsErrorFree()){
      updateRequest('request');
    }
    e.preventDefault();
  });

});