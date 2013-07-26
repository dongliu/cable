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
      }, {
        'sTitle': 'Last visited on'
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
    users = json.map(function(user) {
      return [].concat(user.id).concat(user.name).concat(user.roles.join()).concat(user.lastVisitedOn? moment(user.lastVisitedOn).format('YYYY-MM-DD HH:mm:ss') : '' );
    });
    userTable.fnClearTable();
    userTable.fnAddData(users);
    userTable.fnDraw();
    // addClick($('#users'), userTable, 7);
    $('tbody tr', '#users').click(function(e) {
      var id = userTable.fnGetData(this, 0);
      var user;
      for(var i = 0; i < json.length; i += 1) {
        if (json[i].id === id) {
          user = json[i];
          break;
        }
      }
      if (user) {
        for (i = 0; i < user.roles.length; i += 1) {
          $('#'+user.roles[i]).prop('checked', true);
        }
        // delete user.roles;
        // $('ad-details').html(json2List(roles));
        // $('#users').hide();
        // $('#user-details').show();
      }

    });
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
  }).always();


  // $('#name').autocomplete({
  //   minLength: 1,
  //   source: function(req, res) {
  //     var term = req.term.toLowerCase();
  //     var output = [];
  //     var key = term.charAt(0);
  //     if (key in nameCache) {
  //       for (var i = 0; i < nameCache[key].length; i += 1) {
  //         if (nameCache[key][i].toLowerCase().indexOf(term) === 0) {
  //           output.push(nameCache[key][i]);
  //         }
  //       }
  //       res(output);
  //       return;
  //     }
  //     $.getJSON('/adusernames', req, function(data, status, xhr) {
  //       var names = [];
  //       for (var i = 0; i < data.length; i += 1) {
  //         if (data[i].displayName.indexOf(',') !== -1) {
  //           names.push(data[i].displayName);
  //         }
  //       }
  //       nameCache[term] = names;
  //       res(names);
  //     });
  //   },
  //   select: function(event, ui) {
  //     $('#name').val(ui.item.value);
  //   }
  // });

});

