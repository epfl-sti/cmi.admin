Billables = new Meteor.Collection("billables");

Billables.editingRow = new ReactiveVar();

Billables.columns =
  ["type", "operatedByUser", "billableToAccount", "billableToProject",
   "startTime", "billingDetails", "discount", "validationState"];

/* Build dataTable*/
function makeTable() {
  return new Tabular.Table({
    name: "Billables",
    collection: Billables,
    columns: _.map(Billables.columns, function(colSymbol) {
      return {
        data: colSymbol,
        title: TAPi18n.__("Billables.column." + colSymbol),
        defaultContent: "-",
        tmpl: Meteor.isClient && Template["Billable$cell$" + colSymbol],
      };
    }),
    language: Tabular.Translations.getCurrent(),
    //http://datatables.net/extensions/select/examples/initialisation/cells.html

    select: {
      style: "os",
      items: "cell",
    },

    initComplete: function() {
      setupColumnFilterUI(this);
    }
  });
}

function setupColumnFilterUI(dataTableElement) {
  var columns = dataTableElement.api().columns();
  // From https://datatables.net/examples/api/multi_filter_select.html
  columns.every( function () {
    var column = this;

    var translate = function(str) {
      return String(str).toUpperCase(); // XXX Just an example
    };

    var context = {
      index: column.index(),
      type: Billables.columns[column.index()],
      translateType: function(type) {
        return TAPi18n.__("Billables.column." + type)
      },
      sortedValues: [{
        value: "usage_fee", translate: translate
      },
        {value: "reservation_fee", translate: translate
        },
        {value: "access_fee", translate: translate
  }
      ]
    };

    $(column.header()).empty();

    var view = Template.Billable$columnHead.constructView();
    // Event handlers need access to the column object:
    view.templateInstance().dataTable = {
      column: column
    };
    Blaze.renderWithData(view, context, column.header());
  });
}

if (Meteor.isClient) {
  // When selects in column headers change, filter values accordingly
  Template.Billable$columnHead.events({
    'change select': function(event, template) {
      var val = $.fn.dataTable.util.escapeRegex(
          $(event.target).val()
      );
      template.dataTable.column
          .search( val ? '^'+val+'$' : '', true, false )
          .draw();
    }
  });
}

function allValuesInColumn(collection, columnName) {
  return _.sortBy(_.uniq(_.pluck(collection.find({}).fetch(), columnName)), function(t) {return t})
}

var theTable = makeTable();


if (Meteor.isClient) {

  Template.Billables$Edit.helpers({makeTable: theTable});

  /* To edit a table row, click on it */
  Template.Billables$Edit.events({
    'click tbody > tr': function (event) {

      var dataTable = $( event.target ).closest( 'table' ).DataTable();
      var rowData = dataTable.row( event.currentTarget ).data();

      if (rowData) {
        Billables.editingRow.set( rowData );
      }
    }
  });

  Template.Billables$Edit.helpers({
    editingRow: function () {
      var rowData = Billables.editingRow.get();
      return (rowData && rowData._id) ? rowData._id: "nothing";
    },
  });

  var allCellTemplates = Billables.columns.map(function(x) {return Template["Billable$cell$" + x]});

  allCellTemplates.forEach(function(tmpl){
    if (! tmpl) return;
    tmpl.helpers({
      isEditing: function() {
        var editingRow = Billables.editingRow.get();
        return (editingRow && editingRow._id && (editingRow._id === Template.currentData()._id));
      },
      formattedDate: function() {
        return(moment(this.date).format('LLL'));

      }
    });
  });

}

/* Table cell I18N */
if (Meteor.isClient) {
  Template.Billable$cell$type.helpers({translateCategory: function(category) {
    return TAPi18n.__("Billables.category." + category);
  }});


  Template.Billable$cell$startTime.onRendered(function() {
   // $('#datetimepicker1').datetimepicker();

  });
}

