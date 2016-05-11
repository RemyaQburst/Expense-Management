pageSetUp();

// pagefunction
var pagefunction = function () {

    var responsiveHelper_dt_basic = undefined;
    var responsiveHelper_datatable_fixed_column = undefined;
    var responsiveHelper_datatable_col_reorder = undefined;
    var responsiveHelper_datatable_tabletools = undefined;

    var breakpointDefinition = {
        tablet: 1024,
        phone: 480
    };

    $('#dt_basic').dataTable({
        "sDom": "<'dt-toolbar'<'col-xs-12 col-sm-6'f><'col-sm-6 col-xs-12 hidden-xs'l>r>" +
        "t" +
        "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>",
        "autoWidth": true,
        "preDrawCallback": function () {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper_dt_basic) {
                responsiveHelper_dt_basic = new ResponsiveDatatablesHelper($('#dt_basic'), breakpointDefinition);
            }
        },
        "rowCallback": function (nRow) {
            responsiveHelper_dt_basic.createExpandIcon(nRow);
        },
        "drawCallback": function (oSettings) {
            responsiveHelper_dt_basic.respond();
        }
    });
}
// load related plugins

loadScript("js/plugin/datatables/jquery.dataTables.min.js", function () {
    loadScript("js/plugin/datatables/dataTables.colVis.min.js", function () {
        loadScript("js/plugin/datatables/dataTables.tableTools.min.js", function () {
            loadScript("js/plugin/datatables/dataTables.bootstrap.min.js", function () {
                loadScript("js/plugin/datatable-responsive/datatables.responsive.min.js", pagefunction)
            });
        });
    });
});