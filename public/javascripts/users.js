$(function() {
  var users = [];
  var nameCache = {};
  var userTable = $('#users').dataTable({
    'aaData': users,
    'bAutoWidth': false,
    'aoColumns': [{
      'sTitle': 'ID'
    }, {
      'sTitle': 'Full name'
    }, {
      'sTitle': 'Privileges'
    }, {
      'sTitle': 'Last visited on'
    }],
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
      // return [].concat(user.id).concat(user.name).concat(rolesForm(user.roles)).concat(user.lastVisitedOn ? moment(user.lastVisitedOn).format('YYYY-MM-DD HH:mm:ss') : '');
      return [].concat(user.id).concat(user.name).concat(user.roles.join()).concat(user.lastVisitedOn ? moment(user.lastVisitedOn).format('YYYY-MM-DD HH:mm:ss') : '');
    });
    userTable.fnClearTable();
    userTable.fnAddData(users);
    userTable.fnDraw();
    $('tbody tr', '#users').click(function(e) {
      var id = userTable.fnGetData(this, 0);
      window.open('/users/' + id);
      e.preventDefault();
    });

    // $('tbody tr button', '#users').click(function(e) {
    //   var id = userTable.fnGetData($(this).parent().closest('tr')[], 0);
    //   var roles = $('input:checked', $(this).parent()).val();
      // var request = $.ajax({
      //   url: '/users/'+id,
      //   type: 'PUT',
      //   async: true,
      //   data: JSON.stringify({
      //     roles: roles
      //   }),
      //   contentType: 'application/json',
      //   processData: false,
      //   dataType: 'json'
      // }).done(function(json) {
      //   var timestamp = request.getResponseHeader('Date');
      //   var dateObj = moment(timestamp);
      //   $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>The modification was saved at ' + dateObj.format('HH:mm:ss') + '.</div>');
      // }).fail(function(jqXHR, status, error) {
      //   // TODO change to modal
      //   alert('The save request failed. You might need to try again or contact the admin.');
      // }).always(function() {});
      // e.preventDefault();
    // });
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
  }).always();

});

function rolesForm(roles) {
  var form = $('form[name = "roles"]').clone();
  form.show();
  for (var i = 0; i < roles.length; i += 1) {
    $('input[value= "' + roles[i] + '"]', form).attr('checked', 'checked');
  }
  return form.html();
}