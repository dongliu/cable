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

function formatDateLong(date) {
  return date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
}

function history(found) {
  var i, output = '';
  if (found.length > 0) {
    for (i = 0; i < found.length; i += 1) {
      output = output + 'changed to <strong>' + found[i].newValue + '</strong> from <strong> ' + found[i].oldValue + ' by ' + found[i].inputBy + ' on ' + formatDateLong(found[i].inputOn) + '; ';
    }
  }
  return output;
}

var template = {
  request: {
    e: '$.request_id',
    // t: function (v) {
    //   return v[0];
    // },
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
      l: 'span[name="project"]'
    },
    engineer: {
      e: '$.engineer',
      l: 'span[name="engineer"]'
    },
    wbs: {
      e: '$.wbs',
      l: 'span[name="wbs"]'
    },
    originCategory: {
      e: '$.originCategory',
      l: function (v) {
        $('span[name="originCategory"]').text(v);
        $('span[name="originCategoryName"]').text(sysSub[v].name || 'unknown');
      }
    },
    originSubcategory: {
      e: '$.originSubcategory',
      l: function (v) {
        $('span[name="originSubcategory"]').text(v);
        var cat = $('span[name="originCategory"]').text();
        $('span[name="originSubcategoryName"]').text(sysSub[cat].subcategory[v] || 'unknown');
      }
    },
    signalClassification: {
      e: '$.signalClassification',
      l: function (v) {
        $('span[name="signalClassification"]').text(v);
        var cat = $('span[name="originCategory"]').text();
        $('span[name="signalClassificationName"]').text(sysSub[cat].signal[v].name || 'unknown');
      }
    },
    cableType: {
      e: '$.cableType',
      l: 'span[name="cableType"]'
    },
    service: {
      e: '$.service',
      l: 'span[name="service"]'
    },
    traySection: {
      e: '$.traySection',
      l: 'span[name="traySection"]'
    },
    tags: {
      e: '$.tags',
      l: 'span[name="tags"]'
    }
  },

  from: {
    root: '$.from',
    rack : {
      e: '$.rack',
      l: 'span[name="from.rack"]'
    },
    terminationDevice: {
      e: '$.terminationDevice',
      l: 'span[name="from.terminationDevice"]'
    },
    terminationType: {
      e: '$.terminationType',
      l: 'span[name="from.terminationType"]'
    },
    wiringDrawing: {
      e: '$,wiringDrawing',
      l: 'span[name="from.wireDrawing"]'
    }
  },

  to: {
    root: '$.to',
    rack : {
      e: '$.rack',
      l: 'span[name="to.rack"]'
    },
    terminationDevice: {
      e: '$.terminationDevice',
      l: 'span[name="to.terminationDevice"]'
    },
    terminationType: {
      e: '$.terminationType',
      l: 'span[name="to.terminationType"]'
    },
    wiringDrawing: {
      e: '$,wiringDrawing',
      l: 'span[name="to.wireDrawing"]'
    }
  },

  comments: {
    e: '$.comments',
    l: 'span[name="comments"]'
  },

  approvedBy: {
    e: '$.approvedBy',
    l: function(v) {
      $('#approvedBy').prop('href', '/users/' + v + '/');
      $('#approvedBy').text(v);
    }
  },
  approvedOn: {
    e: '$.approvedOn',
    l: function (v) {
      $('#approvedOn').text(formatDateLong(v[0]));
    }
  },

  submittedBy: {
    e: '$.submittedBy',
    l: function(v) {
      $('#submittedBy').prop('href', '/users/' + v + '/');
      $('#submittedBy').text(v);
    }
  },
  submittedOn: {
    e: '$.submittedOn',
    l: function (v) {
      $('#submittedOn').text(formatDateLong(v[0]));
    }
  }

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
