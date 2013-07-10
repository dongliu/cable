$(function() {
  var cableType = [];
  var nameCache = {};
  var wbs;
  var penetration = [];
  var deviceCache = {};
  var rackCache = {};

  var requestForm = document.forms[0];

  // var validation = [
  //   ['#system', 'presence', 'Please select system type'],
  //   ['#sub', 'presence', 'Please select sub system type'],
  //   ['#signal', 'presence', 'Please select signal type'],
  //   ['#type', 'presence', 'Please input cable type'],
  //   ['#engineer', 'presence', 'Please input engineer fullname'],
  //   ['#function', 'presence', 'Please input cable function'],
  //   ['#wbs', 'presence', 'Please input WBS number'],
  //   ['#quality', 'presence', 'Please input the quality'],
  //   ['#quality', 'integer', 'The quality needs to be an integer'],
  //   ['#from-building', 'presence', 'Please input the building'],
  //   ['#from-rack', 'presence', 'Please input the rack'],
  //   ['#from-elevation', 'presence', 'Please input the elevation'],
  //   ['#from-elevation', 'float', 'The elevation needs to be an integer'],
  //   ['#from-termination', 'presence', 'Please input the termination'],
  //   ['#from-type', 'presence', 'Please input the termination'],
  //   ['#from-drawing', 'presence', 'Please input the wiring drawing'],
  //   ['#from-label', 'presence', 'Please input the label'],
  //   ['#to-building', 'presence', 'Please input the building'],
  //   ['#to-rack', 'presence', 'Please input the rack'],
  //   ['#to-elevation', 'presence', 'Please input the elevation'],
  //   ['#to-elevation', 'float', 'The elevation needs to be an integer'],
  //   ['#to-termination', 'presence', 'Please input the termination'],
  //   ['#to-type', 'presence', 'Please input the termination'],
  //   ['#to-drawing', 'presence', 'Please input the wiring drawing'],
  //   ['#to-label', 'presence', 'Please input the label'],
  //   ['#tray', 'presence', 'Please input the tray'],
  //   ['#penetration', 'presence', 'Please input the penetration number'],
  //   ['#position', 'presence', 'Please input the penetration position']
  // ];

  // var validation = [
  //   ['#system', 'presence', 'Please select system type']
  // ];
  
  // $('form[name="request"]').nod(validation);

  $(requestForm.elements).jqBootstrapValidation();
  
  sss();

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
      var system = json.basic.system;
      var subsystem = json.basic.subsystem;
      var signal = json.basic.signal;
      delete json.basic.system;
      delete json.basic.subsystem;
      delete json.basic.signal;
      setSSS(system, subsystem, signal);
      var savedBinder = new Binder.FormBinder(requestForm, json);
      savedBinder.deserialize();

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
  }

  $('#save').click(function(e) {
    updateRequest('save');
    e.preventDefault();
  });

  $('#submit').click(function(e) {
    if (!($(requestForm.elements).jqBootstrapValidation('hasErrors'))) {
      updateRequest('submit');
    }
    e.preventDefault();
  });

  $('#adjust').click(function(e) {
    updateRequest('adjust');
    e.preventDefault();
  });

  $('#reject').click(function(e) {
    updateRequest('reject');
    e.preventDefault();
  });

  $('#request').click(function(e) {
    if (!($(requestForm.elements).jqBootstrapValidation('hasErrors'))) {
      updateRequest('request');
    }
    e.preventDefault();
  });

  $('#approve').click(function(e) {
    if (!($(requestForm.elements).jqBootstrapValidation('hasErrors'))) {
      updateRequest('approve');
    }
    e.preventDefault();
  });


});

// TODO: update the response to inform the user when the request is successful

function updateRequest(action) {
  var path = window.location.pathname;
  var requestObject = {};
  var requestForm = document.forms[0];
  var binder = new Binder.FormBinder(requestForm, requestObject);
  requestObject = binder.serialize();
  // future validation here
  var url, type;
  var data = {
    request: requestObject,
    action: action
  };
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
    $('form[name="request"]').fadeTo('slow', 1);
    // var location = formRequest.getResponseHeader('Location');
    if (/^\/requests\/new/.test(path)) {
      document.location.href = json.location;
    } else {
      if (action == 'save' || action == 'adjust') {
        var timestamp = formRequest.getResponseHeader('Date');
        var dateObj = moment(timestamp);
        $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>The changes saved at ' + dateObj.format('HH:mm:ss') + '.</div>');
      } else {
        $('form[name="request"]').hide();
        $('message').html('<div class="well">The request was submitted and you can access it at <a href ="' + json.location + '">here</a></div>');
      }
    }

  }).fail(function(jqXHR, status, error) {
    alert('The save request failed. You might need to try again or contact the admin.');
  }).always(function() {
    $('#request').fadeTo('slow', 1);
  });
  // $('#test').html(JSON.stringify(requestObject));
}


function getChildren(wbs, term) {
  var parts = term.split('.');
  var key = parts[0];
  var locator = findChild(wbs, key);
  // var result;
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
  $('#system').val(system);
  $('#system').next('.add-on').text(system);
  updateSub(sysSub);
  $('#signal').val(signal);
  $('#signal').next('.add-on').text(signal);
  $('#subsystem').val(subsystem);
  $('#sub').next('.add-on').text(subsystem);
}


function updateSub(json) {
  var sys = $('#system option:selected').val();
  $('#sub').prop('disabled', false);
  $('#sub option').remove();
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

function json2List(json) {
  var output = '';
  for (var k in json) {
    if (json.hasOwnProperty(k)) {
      if (json[k] && typeof(json[k]) === 'object') {
        output = output + '<dl>' + '<dt>' + '<h4>' + k + '</h4>' + '</dt>' + '<dd>' + json2List(json[k]) + '</dd>' + '</dl>';
      } else {
        if (json[k] === null) {
          output = output + '<b>' + k + '</b>' + ' : ' + '<br/>';
        } else {
          output = output + '<b>' + k + '</b>' + ' : ' + json[k] + '<br/>';
        }
      }
    }
  }
  return output;
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
