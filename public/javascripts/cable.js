function formatCableStatus(s) {
  var status = {
    '100': 'approved',
    '101': 'ordered',
    '102': 'received',
    '103': 'accepted',
    '200': 'to install',
    '201': 'labeled',
    '202': 'bench terminated',
    '203': 'bench tested',
    '249': 'to pull',
    '250': 'pulled',
    '251': 'field terminated',
    '252': 'field tested',
    '300': 'working',
    '400': 'failed',
    '501': 'not needed'
  };
  if (status[s.toString()]) {
    return status[s.toString()];
  }
  return 'unknown';
}

var template = {
  request: {
    e: '$.request_id',
    t: function (v) {
      return v[0];
    },
    l: function (v) {
      $('#request').prop('href', '/requests/' + v + '/');
      $('#request').text(v);
    }
  },
  status: {
    e: '$.status',
    t: formatCableStatus,
    l: '#status'
  },
  basic: {
    root: '$.basic',
    project: {
      e: '$.project',
      l: '#project'
    },
    engineer: {
      e: '$.engineer',
      l: '#engineer'
    },
    wbs: {
      e: '$.wbs',
      l: '#wbs'
    },
    originCategory: {
      e: '$.originCategory',
      l: function (v) {
        $('#originCategory').text(v);
        $('#originCategoryName').text(sysSub[v].name || 'unknown');
      }
    },
    originSubcategory: {
      e: '$.originSubcategory',
      l: function (v) {
        $('#originSubcategory').text(v);
        var cat = $('#originCategory').text();
        $('#originSubcategoryName').text(sysSub[cat].subcategory[v] || 'unknown');
      }
    },
    signalClassification: {
      e: '$.signalClassification',
      l: function (v) {
        $('#signalClassification').text(v);
        var cat = $('#originCategory').text();
        $('#signalClassificationName').text(sysSub[cat].signal[v].name || 'unknown');
      }
    },
    cableType: {
      e: '$.cableType',
      l: '#cableType'
    },
    service: {
      e: '$.service',
      l: '#service'
    },
    traySection: {
      e: '$.traySection',
      l: '#traySection'
    },
    tags: {
      e: '$.tags',
      l: '#tags'
    }
  },

  from: {
    root: '$.from',
    rack : {
      e: '$.rack',
      l: '#fromRack'
    },
    terminationDevice: {
      e: '$.terminationDevice',
      l: '#fromTerminationDevice'
    },
    terminationType: {
      e: '$.terminationType',
      l: '#fromTerminationType'
    },
    wiringDrawing: {
      e: '$,wiringDrawing',
      l: '#fromWireDrawing'
    }
  },

  to: {
    root: '$.to',
    rack : {
      e: '$.rack',
      l: '#toRack'
    },
    terminationDevice: {
      e: '$.terminationDevice',
      l: '#toTerminationDevice'
    },
    terminationType: {
      e: '$.terminationType',
      l: '#toTerminationType'
    },
    wiringDrawing: {
      e: '$,wiringDrawing',
      l: '#toWireDrawing'
    }
  },



};

function jsonETL(json, template) {
  var prop, value;
  for (prop in template) {
    if (template.hasOwnProperty(prop)) {
      if (template[prop].root) {
        jsonETL(jsonPath.eval(json, template[prop].root)[0], template[prop]);
      } else {
        value = jsonPath.eval(json, template[prop].e);
        if (template[prop].t && typeof template[prop].t === 'function') {
          value = template[prop].t(value);
        }
        if (template[prop].l) {
          if (typeof template[prop].l === 'string') {
            $(template[prop].l).text(value);
          } else if (typeof template[prop].l === 'function') {
            template[prop].l(value);
          }
        }
      }
    }
  }
}


$(function () {
  $.ajax({
    url: './json',
    type: 'GET',
    dataType: 'json'
  }).done(function (json) {
    jsonETL(json, template);
  }).fail(function (jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable details.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();

  $.ajax({
    url: './changes/json',
    type: 'GET',
    dataType: 'json'
  }).done(function (json) {}).fail(function (jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable change history.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();
});
