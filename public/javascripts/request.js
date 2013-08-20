var initModel;
var binder;
var requestForm;

$(function() {
  var cableType = [];
  var nameCache = {};
  var wbs;
  var penetration = [];
  var deviceCache = {};
  var rackCache = {};

  requestForm = document.forms[0];

  binder = new Binder.FormBinder(requestForm);

  var validator = $(requestForm).validate({
    errorElement: 'span',
    errorClass: 'help-inline',
    errorPlacement: function(error, element){
      error.appendTo($(element).closest('.controls'));
    },
    highlight: function(element) {
      $(element).closest('.control-group').removeClass('success').addClass('error');
    },
    success: function(element){
      $(element).closest('.control-group').removeClass('error').addClass('success');
    }
  });

  if ($('#cableId').length) {
    $('form[name="request"]').fadeTo('slow', 0.2);
  }
  sss();

  // snapshot the initial form model

  $('#type-details').popover({
    html: true
  });

  $('#engineer').autocomplete({
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
      $.getJSON('/adusernames', req, function(data, status, xhr) {
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
      $('#engineer').val(ui.item.value);
    }
  });

  $('#type').autocomplete({
    minLength: 1,
    source: function(req, res) {
      var term = req.term.toLowerCase();
      var output = [];
      if (cableType.length === 0) {
        $.getJSON('/cabletypes/json', req, function(data, status, xhr) {
          cableType = data;
          res(getType(cableType, term));
        });
      } else {
        res(getType(cableType, term));
      }
    },
    select: function(event, ui) {
      $('#type').val(ui.item.value);
      var type = setTypeDetails($('#type').val(), cableType);
      if (type) {
        $('#function').val(type.service);
      }
    }

  });

  $('#wbs').autocomplete({
    minLength: 2,
    source: function(req, res) {
      var term = req.term;
      var output = [];

      if (term.indexOf('.', term.length - 1) == -1) {
        return;
      }

      term = term.substring(0, term.length - 1);
      if (wbs && wbs.children) {
        output = getChildren(wbs, term);
        if (output.length === 0) {
          return;
        }
        res(output);
      } else {
        $.getJSON('/wbs/all', req, function(data, status, xhr) {
          wbs = data;
          output = getChildren(wbs, term);
          if (output.length === 0) {
            return;
          }
          res(output);
        });
      }
    },
    select: function(event, ui) {
      var value = ui.item.value;
    }
  });

  $('#penetration').autocomplete({
    minLength: 1,
    source: function(req, res) {
      var term = req.term.toLowerCase();
      var output = [];
      if (penetration.length === 0) {
        $.getJSON('/penetration', req, function(data, status, xhr) {
          penetration = data;
          res(getList(penetration, term));
        });
      } else {
        res(getList(penetration, term));
      }
    },
    select: function(event, ui) {
      $('#penetration').val(ui.item.value);
    }
  });

  // check if the request is for an existing request
  if ($('#cableId').length) {
    $.ajax({
      url: '/requests/' + $('#cableId').text() + '/json',
      type: 'GET',
      async: true,
      dataType: 'json'
    }).done(function(json) {
      // load the data
      var system, subsystem, signal;
      if (json.basic) {
        system = json.basic.system || null;
        subsystem = json.basic.subsystem || null;
        signal = json.basic.signal || null;
      }

      var savedBinder = new Binder.FormBinder(requestForm, json);
      savedBinder.deserialize();

      setSSS(system, subsystem, signal);

      $('form[name="request"]').fadeTo('slow', 1);

      validator.form();

      initModel = _.cloneDeep(binder.serialize());
      // cable type details
      if ($('#type').val() !== '') {
        if (cableType.length === 0) {
          $.getJSON('/cabletypes/json', function(data, status, xhr) {
            cableType = data;
            setTypeDetails($('#type').val(), cableType);
          });
        } else {
          setTypeDetails($('#type').val(), cableType);
        }
      }
      // show action buttons

      if (!json.hasOwnProperty('submittedBy')) {
        $('#save').closest('.btn-group').show();
        $('#submit').closest('.btn-group').show();
        $('#reset').closest('.btn-group').show();
      } else if (!json.hasOwnProperty('requestedBy')) {
        $('#adjust').closest('.btn-group').show();
        $('#reject').closest('.btn-group').show();
        $('#request').closest('.btn-group').show();
      } else if (!json.hasOwnProperty('approvedBy')) {
        $('#reject').closest('.btn-group').show();
        $('#approve').closest('.btn-group').show();
      }

      if (json.hasOwnProperty('rejectedBy')) {
        $('.form-actions').hide();
      }

    }).fail(function(jqXHR, status, error) {
      alert('Cannot find the saved request.');
    }).always(function() {
      // $('#request').fadeTo('slow', 1);
    });
  } else {
    // $('form[name="request"]').fadeTo('slow', 1);
    // validator.form();
    initModel = _.cloneDeep(binder.serialize());

    $('#save').closest('.btn-group').show();
    $('#submit').closest('.btn-group').show();
    $('#reset').closest('.btn-group').show();
  }

  $('#reset').click(function(e){
    e.preventDefault();
    // requestForm.reset();
    // ($(this).closest('form')[0]).reset();
    binder.deserialize(initModel);
    // initModel = _.cloneDeep(binder.serialize());
  });

  $('.form-actions button').not('#reset').click(function(e){
    e.preventDefault();
    var action = this.id;
    var currentModel = {};
    currentModel = binder.serialize();
    var data = {
      request: currentModel,
      action: action
    };
    if ((action == 'save' || action == 'adjust') && _.isEqual(initModel, currentModel)) {
      $('#modalLable').html('The request cannot be sent');
      $('#modal .modal-body').html('No change has been made in the form');
      // $('#modal .modal-footer').html();
      $('#modal').modal('show');
    } else {
      if (action == 'submit' || action == 'request' || action == 'approve') {
        if ($(requestForm).valid()) {
          sendRequest(data);
        } else {
          $('#modalLable').html('The request cannot be sent');
          $('#modal .modal-body').html('The form has ' + validator.numberOfInvalids() + ' invalid input(s) to fix.');
          // $('#modal .modal-footer').html();
          $('#modal').modal('show');
        }
      } else {
        sendRequest(data);
      }
    }
  });

});


function sendRequest(data) {
  var path = window.location.pathname;

  var url, type;
  if (/^\/requests\/new/.test(path)) {
    url = '/requests';
    type = 'POST';
  } else {
    url = path;
    type = 'PUT';
  }
  $('form[name="request"]').fadeTo('slow', 0.2);
  var formRequest = $.ajax({
    url: url,
    type: type,
    async: true,
    data: JSON.stringify(data),
    contentType: 'application/json',
    processData: false,
    dataType: 'json'
  }).done(function(json) {
    // var location = formRequest.getResponseHeader('Location');
    $('form[name="request"]').fadeTo('slow', 1);
    if (/^\/requests\/new/.test(path)) {
      document.location.href = json.location;
    } else {
      var timestamp = formRequest.getResponseHeader('Date');
      var dateObj = moment(timestamp);
      if (data.action == 'save' || data.action == 'adjust') {
        $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>The changes were saved at ' + dateObj.format('HH:mm:ss') + '.</div>');
        // move the focus to the message
        $(window).scrollTop($('#message div:last-child').offset().top-40);
        initModel = _.cloneDeep(binder.serialize());


      } else {
        $('form[name="request"]').hide();
        $('#modalLable').html('The request was submitted at ' + dateObj.format('HH:mm:ss'));
        if (json && json.location) {
          $('#modal .modal-body').html('You can access it at <a href ="' + json.location + '">' + json.location + '</a>');
        } else {
          $('#modal .modal-body').html('You can access it at <a href ="' + path + '">' + path + '</a>');
        }
        $('#modal .modal-footer').empty();
        $('#modal').modal('show');
      }
    }

  }).fail(function(jqXHR, status, error) {
    // TODO change to modal
    alert('The save request failed. You might need to try again or contact the admin.');
  }).always(function() {
    $('form[name="request"]').fadeTo('slow', 1);
  });
  // $('#test').html(JSON.stringify(requestObject));
}



function getChildren(wbs, term) {
  var parts = term.split('.');
  var key = parts[0];
  var locator = findChild(wbs, key);
  if (locator === null) {
    return [];
  }

  for (var i = 1; i < parts.length; i += 1) {
    key = key + '.' + parts[i];
    locator = findChild(locator, key);
    if (locator === null) {
      return [];
    }
  }

  if (locator.children && locator.children.length !== 0) {
    return $.map(locator.children, function(o) {
      return o.number;
    });
  }

  return [];

}

function findChild(object, childNumber) {
  if (object.children) {
    for (var i = 0; i < object.children.length; i += 1) {
      if (object.children[i].number === childNumber) {
        return object.children[i];
      }
    }
  }
  return null;
}


function getType(type, term) {
  var output = [];
  for (var i = 0; i < type.length; i += 1) {
    if (type[i].name.toLowerCase().indexOf(term) !== -1) {
      output.push(type[i].name);
    }
  }
  return output;
}

function getList(list, term) {
  var output = [];
  for (var i = 0; i < list.length; i += 1) {
    if (list[i].toLowerCase().indexOf(term) !== -1) {
      output.push(list[i]);
    }
  }
  return output;
}


// system/subsystem/signal

function sss() {
  update('#system', sysSub);
  update('#signal', signal);
  $('#system').change(function() {
    updateSub(sysSub);
    $('#system').next('.add-on').text($('#system option:selected').val());
  });

  $('#sub').change(function() {
    $('#sub').next('.add-on').text($('#sub option:selected').val());
  });

  $('#signal').change(function() {
    $('#signal').next('.add-on').text($('#signal option:selected').val());
  });
}

function setSSS(system, subsystem, signal) {
  if (system) {
    $('#system').val(system);
    $('#system').next('.add-on').text(system);
    updateSub(sysSub);
  }
  if (signal) {
    $('#signal').val(signal);
    $('#signal').next('.add-on').text(signal);
  }
  if (subsystem) {
    $('#sub').val(subsystem);
    $('#sub').next('.add-on').text(subsystem);
  }
}


function updateSub(json) {
  var sys = $('#system option:selected').val();
  $('#sub').prop('disabled', false);
  $('#sub option').remove();
  $('#sub').append($('<option>', {
        value: ''
      }).text('choose').prop('disabled', true));
  $.each(json[sys]['sub-system'], function(k, v) {
    if (v) {
      $('#sub').append($('<option>', {
        value: k
      }).text(v));
    }
  });
}

function update(select, json) {
  $(select).prop('disabled', false);
  $.each(json, function(k, v) {
    if (v) {
      $(select).append($('<option>', {
        value: k
      }).text(v['name']));
    }
  });
}

function setTypeDetails(val, cableType) {
  var type = null;
  for (var i = 0; i < cableType.length; i += 1) {
    if (cableType[i].name == val) {
      type = cableType[i];
      break;
    }
  }
  if (type) {
    $('#type-details').attr('disabled', false);
    $('#type-details').attr('data-original-title', type.name);
    $('#type-details').attr('data-content', json2List(type));
    return type;
  }
  return null;
}
