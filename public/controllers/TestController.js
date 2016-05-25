smartApp.controller('TestController', function ($scope, $q, DTOptionsBuilder, DTColumnBuilder, ExpenseService, $timeout, $location) {
    
    $scope.isDefaultTableVisible = true;
    $scope.isApprover = sessionStorage.getItem("userRole") == "Approver";
    $scope.isAdmin = sessionStorage.getItem("userRole") == "Admin";
    var getExpenseDetails = function(){
    
        var defer = $q.defer();
        var objexpenses = ExpenseService.getExpenseData();
        objexpenses.$loaded()
          .then(function (data) {
              $scope.expensesCollection = data;
              $scope.totalExpenses = $scope.expensesCollection.length + 1;
              $scope.expenseList = [];
              var i = 0;
              data.forEach(function (value, key) {
                  i = i + 1;
                  var approvals = [];
                  if ($scope.isAdmin || $scope.isApprover) {
                      var approvalStatusID = value.ApprovalStatusId;
                      $scope.approvalStatuses.forEach(function (item, value1) {
                          var id = item.id;
                          if (id >= approvalStatusID) {
                              var item = {
                                  "id": item.id,
                                  "value": item.value,
                                  "currentStatus": approvalStatusID,
                                  "expenseID": value.Id
                              };
                              approvals.push(item);
                          }
                      });
                  }
                  $scope.expenseList.push({
                      Id: i, ExpenceId: value.Id, Category: value.Category, Project: value.Project, AddedBy: value.UserName, Date: value.Date
                      , Amount: value.Amount + value.Currency, ApprovalStatusID: value.ApprovalStatusId, Status: value.ApprovalStatus, availableStatus: approvals
                  });
                  $scope.isDefaultTableVisible = false;
                 
              });

              defer.resolve($scope.expenseList);
    });
    return defer.promise;
};
    $timeout(function(){
        console.log("expense", $scope.expenseList);
        getExpenseDetails();
    });


$scope.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
    return getExpenseDetails();
})
        //.withOption('columns', [
        //    {"title":"Name"}
    //]);

$scope.dtColumns = [
      DTColumnBuilder.newColumn('Id').withTitle('#'),
      DTColumnBuilder.newColumn('Category').withTitle('Category'),
      DTColumnBuilder.newColumn('Project').withTitle('Project'),
      DTColumnBuilder.newColumn('AddedBy').withTitle('AddedBy'),
      DTColumnBuilder.newColumn('Date').withTitle('Date'),
      DTColumnBuilder.newColumn('Amount').withTitle('Amount'),
      DTColumnBuilder.newColumn('Status').withTitle('Status')
];

$scope.goToViewPage = function (i) {
    $location.url('viewExpense');
}














})