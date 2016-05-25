smartApp.controller('ExpensePageController', function ($scope, $modal, $rootScope, $location, $q, ExpenseService, GetStaticDetails, $window, $timeout, $filter) {

    $scope.isloading = true;
    $scope.totalExpenses = 1;

    $scope.userRole = sessionStorage.getItem("userRole");
    $scope.userId = sessionStorage.getItem("userId");

    $scope.isApprover = $scope.userRole == "Approver";
    $scope.isAdmin = $scope.userRole == "Admin";

    $scope.isDefaultTableVisible = true;
    $scope.enableAddExpense = true;
    $scope.cancelButton = false;
    $scope.isReimbursed = false;
    $scope.getCategories = function () {
        GetStaticDetails.getCategories().then
        (
        function (data) {
            $scope.Categories = data;
        },
        function (error) {
            console.log("category could not be fetched");
        });
    }

    $scope.getProjects = function () {
        GetStaticDetails.getProjects().then
        (
        function (data) {
            $scope.projs = data;
        },
        function (error) {
            console.log("category could not be fetched");
        });
    }

    $scope.getApprovers = function () {
        GetStaticDetails.getUsers().then
        (
        function (data) {
            $scope.users = [];
            $scope.apprvrs = [];
            angular.forEach(data, function (user) {
                if(user.Role == "Approver")
                {
                    $scope.apprvrs.push({ value: user.FullName, id: user.Id });
                }
                if($scope.isAdmin && user.Id != sessionStorage.getItem("userId"))
                {
                    $scope.users.push({ value: user.FullName, id: user.Id } );
                }
            });
        },
        function (error) {
            console.log("category could not be fetched");
        });
    }

    function getApprovals() {
        if ($scope.isAdmin || $scope.isApprover) {
            GetStaticDetails.getApprovalStatus().then
            (
            function (data) {
                $scope.approvalStatuses = data;
                debugger
            },
            function (error) {
                console.log("category could not be fetched");
            });
        }
    }
    getApprovals();

    $scope.getCategories();
    $scope.getApprovers();
    $scope.getProjects();


    $scope.Open = function (size) {


        var myModalInstance = $modal.open({
            animation: true,
            templateUrl: 'addexpenseModal.html',
            controller: 'modalInstanceCntrl',
            size: size,
            scope:$scope,
            resolve:
                {
                    category : function()
                    {
                        return $scope.Categories;
                    },
                    project : function()
                    {
                        return $scope.projs;
                    },
                    approver: function () {
                        return $scope.apprvrs;
                    },
                    onbehalf: function () {
                        return $scope.users;
                    },
                    uid: function () {
                        return $scope.totalExpenses;
                    }
            }
        });

        myModalInstance.result.then(
            function () {
                //this is called when the modal is closed.
                $scope.totalExpenses += 1;
                $timeout(function () {
                    console.log("ModalInstanceExpense", $scope.expenseList);
                    getExpenseDetails();
                });
            },
            function () {
                //this is called when the modal is dismissed.
            }
        );
    }

    $scope.goToViewPage = function (expense) {
        sessionStorage.setItem("expenseId", expense.ExpenceId);
        $location.url('viewExpense');

    }

    $scope.setSelectedStatus = function (e) {
        e.stopPropagation();
    }

    $scope.onApprovalStatusChange = function (index) {
      debugger
        ExpenseService.changeApprovalStatus($scope.expenseList1[index].ExpenceId, $scope.expenseList1[index].Status).then(function (result) {
            alert("success");
        },
           function () {
               console.log("Error changing status");
           });
        //$scope.expenseList[index].availableStatus = populateApprovals($scope.expenseList[index]);
        $scope.expenseList1[index].availableStatus = populateApprovals($scope.expenseList1[index].Status);
        if ($scope.expenseList1[index].availableStatus == 0)
        {
            $scope.isReimbursed = true;

        }
        $scope.expenseList1[index].selectedStatus = $scope.expenseList1[index].Status.value;
        $scope.expenseList1[index].ApprovalStatusID = $scope.expenseList1[index].Status.id;
        $scope.expenseList1[index].Status = $scope.expenseList1[index].Status;
    }
    // ToDo : If Normal user  , push into expense list where loginId == expense.UserId
    // If Approver, push into expense list where loginId == expense.approverId
    // If Admin push all the expenses.
    // Hence expenseData should have a userId, approverID, user fullname(added by)
    // Write logic to solve the reload issue of dt.
    // Wrap inside a function and call it from model close also.
    // We need a different id to show in the table and expid to be saved different.

    var getExpenseDetails = function () {
        $scope.isDefaultTableVisible = true;
        ExpenseService.getExpenseData().then(function(response){
          if(response.data.length>0) {
           var data = response.data;
           var defer = $q.defer();
           $scope.expensesCollection = data;
              $scope.totalExpenses = (data[data.length - 1].Id)+1;
              //$scope.totalExpenses = $scope.expensesCollection.length + 1;
              $scope.expenseList = [];
              var i = 0;
              data.forEach(function (value, key) {

                  $scope.approvals = [];
                  if ($scope.isAdmin || $scope.isApprover) {
                      $scope.approvals = populateApprovals(value);

                  }
                  switch ($scope.userRole) {
                      case "Approver":
                          if (value.ApproverId == $scope.userId) {
                              i = i + 1;
                              var expAmount = $filter('number')(value.Amount);
                              $scope.expenseList.push({
                                  Id: i, ExpenceId: value.Id, Category: value.Category, Project: value.Project, AddedBy: value.UserName, Date: value.Date
                                  , Amount: expAmount +" "+ value.Currency, ApprovalStatusID: value.ApprovalStatusId, Status: value.ApprovalStatus, availableStatus: $scope.approvals, selectedStatus: value.ApprovalStatus                              });

                          }
                          break;
                      case "Admin":
                          i = i + 1;
                          var expAmount = $filter('number')(value.Amount);
                          $scope.expenseList.push({
                              Id: i, ExpenceId: value.Id, Category: value.Category, Project: value.Project, AddedBy: value.UserName, Date: value.Date
                              , Amount: expAmount + " " + value.Currency, ApprovalStatusID: value.ApprovalStatusId, Status: value.ApprovalStatus, availableStatus: $scope.approvals, selectedStatus: value.ApprovalStatus
                          });


                          break;
                      case "Normal":
                          if (value.UserId == $scope.userId) {
                            var expAmount = $filter('number')(value.Amount);
                              i = i + 1;
                              $scope.expenseList.push({
                                  Id: i, ExpenceId: value.Id, Category: value.Category, Project: value.Project, AddedBy: value.UserName, Date: value.Date
                                  , Amount: expAmount + " " + value.Currency, ApprovalStatusID: value.ApprovalStatusId, Status: value.ApprovalStatus, availableStatus: $scope.approvals, selectedStatus: value.ApprovalStatus
                              });

                          }
                          break;
                      default:
                      var expAmount = $filter('number')(value.Amount);
                          $scope.expenseList.push({
                              Id: i, ExpenceId: value.Id, Category: value.Category, Project: value.Project, AddedBy: value.UserName, Date: value.Date
                              , Amount: expAmount + " " + value.Currency, ApprovalStatusID: value.ApprovalStatusId, Status: value.ApprovalStatus, availableStatus: $scope.approvals, selectedStatus: value.ApprovalStatus
                          });
                  }

              });
              $scope.isDefaultTableVisible = false;
              $scope.enableAddExpense = false;
              defer.resolve($scope.expenseList);
              // $scope.disableSelect=
              $scope.$watch('expenseList', handleModelUpdates, true);
              function handleModelUpdates(newData) {
                  console.log("expenses", $scope.expenseList);
                  var data = newData || null;
                  $scope.isDefaultTableVisible = true;
                  $scope.isTableVisible = false;
                  if (data) {
                      $scope.expenseList1 = $filter('orderBy')($scope.expenseList, 'Date').reverse();
                      //$scope.expenseList1 = $scope.expenseList;
                      $scope.isDefaultTableVisible = false;
                      $scope.isloading = false;
                      $scope.enableAddExpense = false;
                  }
              }

              //Only approver and admin can view the AddedBy and Status change columns
              var isAdminOrApprover = ($scope.isAdmin || $scope.isApprover) ? true : false;
              return defer.promise;
            }
        });
        
    }

    $timeout(function () {
        console.log("expense", $scope.expenseList);
        getExpenseDetails();
    });

    function populateApprovals(val)
    {
        var apprs = [];
        var approvalStatusID = angular.isUndefined(val.ApprovalStatusId) ? val.$id : val.ApprovalStatusId;
        if ($scope.isApprover){
          $scope.approvalStatuses.forEach(function (item, value1) {
              var id = item.id;
              if (id !== "4" && id > approvalStatusID) {
                  if(approvalStatusID == "2" && id === "3"){
                    return apprs;
                  }
                  var item = {
                      "id": item.id,
                      "value": item.value,
                      "currentStatus": approvalStatusID,
                      "expenseID": angular.isUndefined(val.ApprovalStatusId) ? val.$id : val.ApprovalStatusId
                  };
                  apprs.push(item)
              }
          });
      }
      else if ($scope.isAdmin){
        $scope.approvalStatuses.forEach(function (item, value1) {
            var id = item.id;
            if (approvalStatusID === "3" && id > approvalStatusID ) {
                var item = {
                    "id": item.id,
                    "value": item.value,
                    "currentStatus": approvalStatusID,
                    "expenseID": angular.isUndefined(val.ApprovalStatusId) ? val.$id : val.ApprovalStatusId
                };
                apprs.push(item)
            }
        });
      }
        return apprs;
    }
});


smartApp.controller('modalInstanceCntrl', function ($scope, $modalInstance, $http, category, project, approver, onbehalf, Upload, uid, ExpenseService, $filter, $rootScope) {

    $scope.data = {};

    $scope.loading = false;

    $scope.currencies = [{ name: "INR" }, { name: "USD" }, { name: "PLN" }, { name: "GBP"}];
    $scope.data.currency = $scope.currencies[0];
    console.log("sel currency", $scope.currency);
    console.log("currencies", $scope.currencies);

    $scope.data.reimburse = false;

    $scope.data.valuationDate = new Date();
    $scope.maxDate = new Date();
    $scope.data.valuationDatePickerIsOpen = false;

    $scope.valuationDatePickerOpen = function () {

        $scope.data.valuationDatePickerIsOpen = !$scope.data.valuationDatePickerIsOpen;
    };

    console.log("category",category);
    $scope.expenseCategories = category;
    $scope.isAdmin = sessionStorage.getItem("userRole") == "Admin";
    $scope.projects = project;
    $scope.approvers = approver;
    $scope.users = onbehalf;

    $scope.ok = function (valid, files) {

        $scope.submitted = true;
        $scope.loading = true;

        var dateObj = $filter('date')(new Date($scope.data.valuationDate), 'MM/dd/yyyy');
        console.log("date", dateObj);
        if (valid)
        {
            var expId = uid;
            var expCategorie = $scope.data.selCategory.value;
            var expFiles = files;
            if (angular.isUndefined($scope.data.selProject))
            {
                var expProject = null;
            }
            else
            {
                var expProject = $scope.data.selProject.value;
            }

            var expAmount = $scope.data.amnt;
            var expCurrency = $scope.data.currency.name;
            var expDesc = angular.isUndefined($scope.data.desc)?null:$scope.data.desc;
            var expDate = $filter('date')(new Date($scope.data.valuationDate), 'MM/dd/yyyy');
            var expStatusId = 1;
            var expStatus = "Pending";
            var expApprover = $scope.data.selApprover.value;
            var expApproverId = $scope.data.selApprover.id;

            var expReimburse = $scope.data.reimburse;
            if($scope.isAdmin)
            {
                var expUser = $scope.data.selOnbehalf.value;
                var expUserid = $scope.data.selOnbehalf.id;
            }
            else
            {
                var expUser = sessionStorage.getItem("loginName");
                var expUserid = sessionStorage.getItem("userId");
            }
            console.log("file", expFiles);
            var dataObj = {
                Id: expId, Amount: expAmount, ApprovalStatus: expStatus, ApprovalStatusId: expStatusId, Approver: expApprover,
                ApproverId: expApproverId, Category: expCategorie, ChargeToClient: expReimburse, Date: expDate, Project: expProject, Reason: expDesc, UserId: expUserid,
                UserName: expUser, Currency: expCurrency
            };

            ExpenseService.setExpenseData(dataObj, Upload, expId, expFiles).then(function (result) {
                $modalInstance.close();
           },
            function () {
                alert("Error Adding Expense");
            });


            /*console.log("amt",$scope.data.amnt);
            console.log("proj",$scope.data.selProject);
            console.log("appr",$scope.data.selApprover.value);
            console.log(files);*/
            // $modalInstance.close();
        }

    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
