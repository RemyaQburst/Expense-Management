smartApp.controller('ViewExpenseController', ['$modal', '$scope', '$rootScope', 'GetStaticDetails', 'ExpenseService', '$q', '$filter', 'Upload', '$timeout', '$location', function ($modal, $scope, $rootScope, GetStaticDetails, ExpenseService, $q, $filter, Upload, $timeout, $location) {
    $scope.selectedexpenseId = sessionStorage.getItem("expenseId");
    $scope.valuationDate = new Date();
    $scope.valuationDatePickerIsOpen = false;
    $scope.valuationDatePickerOpen = function () {
        $scope.valuationDatePickerIsOpen = true;
    };
    $scope.isAdmin = sessionStorage.getItem("userRole") == "Admin";
    $scope.isApprover = sessionStorage.getItem("userRole") == "Approver";
    $scope.currencies = [{ name: "INR" }, { name: "$" }, { name: "PLN" }, { name: "£" }];
    $scope.selectCurrencyAdmin = "INR";

    $scope.editButton = true;
    $scope.detailsView = true;
    $scope.editView = false;
    $scope.updateButton = false;
    $scope.approvalStatusEditMode = false;
    $scope.approvalStatusFixedMode = true;
    $scope.isStatusApproved = false;
    $scope.GetCategories = function () {
        GetStaticDetails.getCategories().then
        (
        function (data) {
            $scope.categories = data;
        },
        function (error) {
            console.log("category could not be fetched");
        });
    }

    $scope.GetProjects = function () {
        GetStaticDetails.getProjects().then
        (
        function (data) {
            $scope.projects = data;
        },
        function (error) {
            console.log("category could not be fetched");
        });
    }

    $scope.GetApprovalstatus = function () {
        GetStaticDetails.getApprovalStatus().then
        (
        function (data) {
            $scope.status = data;

            $scope.selectapprovalStatus = $scope.status[0].value;
            $scope.selectapprovalStatusAdmin = $scope.status[0].value;
        },
        function (error) {
            console.log("Approval status could not be fetched");
        });
    }
    $scope.GetUsers = function () {
        GetStaticDetails.getUsers().then
        (
        function (data) {
            $scope.onBehalfOf = data;
        },
        function (error) {
            console.log("Approval status could not be fetched");
        });
    }

    $scope.GetCategories();
    $scope.GetApprovalstatus();
    $scope.GetProjects();
    $scope.GetUsers();
    //Bind Data for initial loading
    BindView();

    $scope.showImage = function (size) {
        if (!angular.isUndefined($scope.uploadedInvoice)) {
            var myModalInstance = $modal.open({
                animation: true,
                scope: $scope,
                templateUrl: 'showInvoice.html',
                size: size,
                windowClass: 'app-modal-window'
            });
        }
    }

    $scope.Edit = function () {
        $scope.editButton = false;
        $scope.cancelButton = true;
        $scope.editView = true;
        $scope.updateButton = true;
        var userRole = sessionStorage.getItem("userRole");
        ShowEditViewForUserRole(userRole);
        getExpenseHistory($scope.selectedexpenseId);
        if (userRole == "Normal" || userRole == "Admin") {
            LoadExpenseDetails(userRole);
        }
        if (sessionStorage.getItem("userRole") == "Approver") {
            ShowEditViewForUserRole("Approver");
            ExpenseService.getExpenseById($scope.selectedexpenseId).then(function (response) {
             var data = response.data;
               $scope.selectedExpense = data;
               LoadExpenseDetails(userRole);
           });

        }
        if (sessionStorage.getItem("userRole") == "Admin") {
            $scope.detailsView = false;
            $scope.editViewAdmin = true;
            LoadExpenseDetails(userRole);
        }
    }

    function ShowEditViewForUserRole(role) {
        if (role == "Normal") {
            $scope.detailsView = false;
            $scope.IsNormalUser = true;
            $scope.editViewNormalUser = true;
        }
        else if (role == "Admin") {
            $scope.detailsView = false;
            $scope.editViewAdmin = true;
        }
        else {
            $scope.detailsView = true;
            $scope.approvalStatusEditMode = true;
            $scope.approvalStatusFixedMode = false;
        }
    }

    $scope.Save = function (files) {
        $scope.editButton = true;
        $scope.detailsView = true;
        $scope.editView = false;
        $scope.cancelButton = false;
        var role = sessionStorage.getItem("userRole");
        $scope.submitted = true;
        switch (role) {
            case 'Normal':
                if ($scope.formEditNormalUser.$valid) {
                    updateExpenseDataByNormalUser(role, files);
                    $scope.editViewNormalUser = false;
                    BindView(role);
                }
                else {
                    $scope.editViewNormalUser = true;
                    $scope.detailsView = false;
                    $scope.editButton = false;
                    $scope.cancelButton = true;
                }
                break;
            case 'Approver':
                $scope.approvalStatusEditMode = false;
                if ($scope.approvalStatusFixedMode == false && $scope.approvalStatus != "Reimbursed") {
                    updateApprovalStatusByApprover(role);
                }
                $scope.approvalStatusFixedMode = true;

                BindView(role);
                break;
            case 'Admin':
                if ($scope.formEditAdmin.$valid) {
                    $scope.editViewAdmin = false;
                    updateExpenseDetailsByAdmin(role, files);
                    $scope.editViewAdmin = false;
                    BindView(role);
                }
                else {
                    $scope.editViewAdmin = true;
                    $scope.detailsView = false;
                    $scope.editButton = false;
                    $scope.cancelButton = true;


                }
                break;
            default:
        }

    }
    $scope.Cancel = function () {
        var role = sessionStorage.getItem("userRole");
        $scope.updateButton = false;
        $scope.editButton = true;
        $scope.cancelButton = false;
        switch (role) {
            case 'Normal':
                $scope.editViewNormalUser = false;
                $scope.detailsView = true;

                break;
            case 'Approver':
                $scope.approvalStatusFixedMode = true;
                $scope.approvalStatusEditMode = false;
                break;
            case 'Admin':
                $scope.editViewAdmin = false;
                $scope.detailsView = true;
                break;
        }
        $location.url('ExpensePage');
    }

    function LoadExpenseDetails(userRole) {
        debugger
        ExpenseService.getExpenseById($scope.selectedexpenseId).then(function (response) {
                data = response.data;
               switch (userRole) {
                   case 'Normal':
                       $scope.selectedExpense = data;
                       $scope.selectCategory = data.Category;
                       $scope.valuationDate = $filter('date')(new Date(data.Date), 'MM/dd/yyyy');
                       //$scope.valuationDate = data.Date;
                       $scope.selectProject = data.Project;
                       $scope.descriptionEditNormal = data.Reason;
                       $scope.amount = data.Amount;
                       $scope.selectCurrencyNormalUser = data.Currency;
                       $scope.clientReimbursementOption = data.ChargeToClient;
                       $scope.uploadedInvoice = data.Invoice;
                       $scope.selectonBehalfOf = data.UserId;
                       console.log("$scope.selectonBehalfOf", $scope.selectonBehalfOf);
                       break;
                   case 'Approver':
                       if (data.ApprovalStatusId == 4) {
                           $scope.isReimbursed = true;
                           $scope.approvalStatusFixedMode = true;
                       }
                       else {
                           $scope.isReimbursed = false;
                           LoadApprovalStatus(data.ApprovalStatusId);
                       }
                       break;
                   case 'Admin':
                       PopulateDataforAdminEditView(data);
                       break;
                   default:
               }

               getExpenseHistory($scope.selectedexpenseId);

           });
    }
    function BindView() {
        ExpenseService.getExpenseById($scope.selectedexpenseId).then(function (response) {
             var data = response.data;
             $scope.selectedExpense = data;
             $scope.addedPerson = data.UserName;
             $scope.claimNum = data.Id;
             $scope.category = data.Category;
             $scope.date = $filter('date')(new Date(data.Date), 'MM/dd/yyyy');
             //$scope.date = data.Date;
             $scope.project = data.Project;
             $scope.description = data.Reason;
             $scope.amountClaimed =$filter('number')(data.Amount);
             $scope.currencyType = data.Currency;
             var chargeToClient = data.ChargeToClient ? "Yes" : "No";
             $scope.clientReimbursement = chargeToClient;
             $scope.approver = data.Approver;
             $scope.approvalStatus = data.ApprovalStatus;
             if (data.ApprovalStatus == "Reimbursed") {
                 $scope.approvalStatusFixedMode = true;
                 $scope.isReimbursed = true;
             }
             else {

                 $scope.isReimbursed = false;
             }
             $scope.uploadedInvoice = "";
             $scope.uploadedInvoice = data.Invoice;
             $scope.selectonBehalfOf = data.UserName;
             $scope.updateButton = false;
             console.log($scope.selectedexpenseId);
             getExpenseHistory($scope.selectedexpenseId);
         });


    }
    function LoadApprovalStatus(currentStatusID) {
        var approvals = [];
        $scope.status.forEach(function (item, value1) {
            var id = item.id;
            if (id >= currentStatusID) {
                var item = {
                    "id": item.id,
                    "value": item.value
                };
                approvals.push(item);
            }
        });
        $scope.status = approvals;
        var approvalStatus = $filter("filter")($scope.status, { id: currentStatusID });
        $scope.selectapprovalStatus = approvalStatus[0].value;
        if ($scope.selectapprovalStatus == "Approved")
            $scope.isStatusApproved = true;
    }


    function PopulateDataforAdminEditView(data) {
        $scope.selectCategory = data.Category;
        $scope.selectProject = data.Project;
        $scope.selectonBehalfOf = data.UserId;
        $scope.amountAdmin = data.Amount;
        var chargeToClient = data.ChargeToClient ? "Yes" : "No";
        $scope.clientReimbursementAdmin = chargeToClient;
        var approvalStatus = $filter("filter")($scope.status, { id: data.ApprovalStatusId });
        if (data.ApprovalStatus == "Reimbursed") {
            $scope.isReimbursed = true;
        }
        else {
            $scope.isReimbursed = false;
            $scope.selectapprovalStatusAdmin = data.ApprovalStatus;
        }
        $scope.descriptionEditAdmin = data.Reason;
        $scope.adminFile = data.Invoice;
        $scope.selectCurrencyAdmin = data.Currency;
    }



    function updateApprovalStatusByApprover(userRole) {
        var expenseID = $scope.selectedexpenseId
        var statusList = $scope.status;
        var approvalStatus = $filter("filter")(statusList, { value: $scope.selectapprovalStatus });
        var expenseUpdated = ExpenseService.updateStatus(expenseID, approvalStatus[0].id, approvalStatus[0].value);
        updateHistory($scope.notes);
    }

    function updateExpenseDetailsByAdmin(userRole, files) {
        var selectedApprovalStatus;
        var expenseID = $scope.selectedexpenseId
        var category = $scope.selectCategory;
        var date = $filter('date')($scope.date, 'MM/dd/yyyy HH:mm:ss');
        //var date = $scope.date;
        var project = $scope.selectProject;
        var onBehalfOfId = $scope.selectonBehalfOf;
        var onBehalfof = $filter("filter")($scope.onBehalfOf, { Id: $scope.selectonBehalfOf });
        var amount = $scope.amountAdmin;
        var chargeToClient = $scope.clientReimbursementAdmin;
        if ($scope.isReimbursed) {
            selectedApprovalStatus = $filter("filter")($scope.status, { value: "Reimbursed" });
        }
        else {
            var approvalStatus = $scope.selectapprovalStatusAdmin;
            selectedApprovalStatus = $filter("filter")($scope.status, { value: $scope.selectapprovalStatusAdmin });
        }

        var currency = $scope.selectCurrencyAdmin;

        var fileInfo = $scope.adminFile;
        var reason = $scope.descriptionEditAdmin;
        var updateData = {
            Category: category, Amount: amount, Currency: currency, Date: date, Project: project, ChargeToClient: chargeToClient, UserId: onBehalfof[0].Id,
            Username: onBehalfof[0].FullName, Reason: reason, ApprovalStatus: selectedApprovalStatus[0].value, ApprovalStatusId: selectedApprovalStatus[0].id
        }
        updateHistory($scope.notes);
        ExpenseService.updateExpenseDetails(updateData, Upload, expenseID, fileInfo);

    }

    function updateExpenseDataByNormalUser(userRole, files) {
        var expenseID = $scope.selectedexpenseId;
        var category = $scope.selectCategory;
        var amount = $scope.amount;
        var currency = $scope.selectCurrencyNormalUser;
        var date = $filter('date')($scope.valuationDate, 'MM/dd/yyyy HH:mm:ss');
        //var date = $scope.valuationDate;
        var project = $scope.selectProject;
        var chargeToClient = $scope.clientReimbursementOption;
        var reason = angular.isUndefined($scope.descriptionEditNormal) ? null : $scope.descriptionEditNormal;
        var updateJson = { Category: category, Amount: amount, Currency: currency, Date: date, Project: project, ChargeToClient: chargeToClient, Reason: reason }
        var fileInfo = $scope.files;
        updateHistory($scope.notes);
        ExpenseService.updateExpenseDetails(updateJson, Upload, expenseID, fileInfo);

    }
    $scope.expenseHistory="";
    function updateHistory(notes) {
        if (angular.isUndefined(notes)) {
            notes = " ";
        }
        var expenseID = $scope.selectedexpenseId;
        var updatedById = sessionStorage.getItem("userId");
        var updatedByName = sessionStorage.getItem("loginName");
        var updatedOn = $filter('date')(new Date(), 'MMM dd yyyy - HH:mm:ss');
        /* not needed -remya*/
        /*var expenseHistoryID = $scope.expenseHistory.length + 1;
        var expenseHistoryID = ($scope.AllHistoryList[$scope.AllHistoryList.length - 1].Id) + 1;*/
        var updateJson = { ExpenseId: expenseID, UpdatedById: updatedById, UpdatedByFullName: updatedByName, UpdatedOn: updatedOn, Notes: notes }
        $scope.expenseUpdated = ExpenseService.updateHistory(expenseID, updateJson);
    }

    function getExpenseHistory(expenseId) {
        $timeout(function () {
            ExpenseService.getExpenseHistory(expenseId).then(function (response) {
                    var data = response.data,selectedHistoryList;
                    if(data!="null") {
                         selectedHistoryList = $filter("filter")(data, { ExpenseId: expenseId });
                         $scope.expenseHistory = selectedHistoryList;
                         $scope.expenseHistory = $scope.expenseHistory.slice().reverse();
                         $scope.AllHistoryList = data;
                    }
                    else {
                        selectedHistoryList,$scope.expenseHistory, $scope.AllHistoryList = "";
                    }
                 });
        });

    }
    //$scope.$watch('expenseHistory', viewHistory, true);
    function viewHistory(newData) {
        //getExpenseHistory();
    }
    function getByteArryForUploadImage(expFiles) {
        debugger;
        if (!angular.isUndefined(expFiles)) {
            Upload.base64DataUrl(expFiles).then(function (base64Urls) {
                var data;
            });
        }
    }
    $scope.backToExpense = function () {
        $location.url('ExpensePage');
    }


}]);