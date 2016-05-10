/*global fnGetSelected: false*/

var barChart = (function (me, $) {
  var plot = null;
  function query(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, ''); // strip a leading dot
    var a = s.split('.');
    var i;
    for (i = 0; i < a.length; i += 1) {
      if (o.hasOwnProperty(a[i])) {
        o = o[a[i]];
      } else {
        return null;
      }
    }
    return o;
  }

  function drawChart(ctx, selected, oTable, groupBy) {
    var barChartData = {
      labels: [],
      datasets: [{
        fillColor: 'rgba(151,187,205,0.5)',
        strokeColor: 'rgba(151,187,205,0.8)',
        highlightFill: 'rgba(151,187,205,0.75)',
        highlightStroke: 'rgba(151,187,205,1)',
        data: []
      }]
    };
    var data = [];
    var rows;
    var i;
    if (selected.length) {
      selected.forEach(function (row) {
        data.push(oTable.fnGetData(row));
      });
    } else {
      rows = oTable.$('tr', {
        filter: 'applied'
      });
      for (i = 0; i < rows.length; i += 1) {
        data.push(oTable.fnGetData(rows[i]));
      }
      // data = oTable.fnGetData();
    }
    var groups = _.countBy(data, function (item) {
      return query(item, groupBy);
    });
    _.forEach(groups, function (count, key) {
      barChartData.labels.push(key);
      barChartData.datasets[0].data.push(count);
    });
    ctx.clearRect(0, 0, 400, 600);
    if (plot !== null) {
      plot.destroy();
    }
    plot = new Chart(ctx).Bar(barChartData, {
      barShowStroke: false,
      animation: false
    });
  }

  function tableBar(oTable) {
    var selected = fnGetSelected(oTable, 'row-selected');
    if (selected.length) {
      $('#modalLabel').html('Plot a bar chart for the selected ' + selected.length + ' items in current table');
    } else {
      $('#modalLabel').html('Plot a bar chart for all items in the table');
    }
    $('#modal .modal-body').empty();
    $('#modal .modal-body').html('<canvas id="barChart" height="400" width="600"></canvas>');

    $('#modal .modal-footer').html('<form class="form-inline"><select id="bar-key"><option value="basic.wbs">WBS</option><option value="status">Status</option><option value="basic.traySection">Tray section</option><option value="basic.cableType">Cable type</option><option value="basic.engineer">Engineer</option><option value="conduit">Conduit</option></select> <button id="plot" class="btn btn-primary">Plot</button> <button data-dismiss="modal" aria-hidden="true" class="btn">Close</button></form>');

    $('#modal').modal('show');

    $('#plot').click(function (e) {
      e.preventDefault();
      var ctx = $('#barChart')[0].getContext('2d');
      var groupBy = $('#bar-key').val();
      drawChart(ctx, selected, oTable, groupBy);
    });
  }
  return tableBar;
}(barChart || {}, jQuery));
