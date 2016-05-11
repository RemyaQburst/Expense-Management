smartApp.controller('ExpensePageController', function ($scope, $modal, $rootScope, $location, $q, ExpenseService, GetStaticDetails) {

    $scope.default_reimburse = true;
    $scope.isApprover = sessionStorage.getItem("userRole") == "Approver";
    $scope.isAdmin = sessionStorage.getItem("userRole") == "Admin";

    $scope.expenseList = [{
        Id : "1",
        Category : "Bill",
        Project : "A",
        AddedBy : "Aparna",
        Date : "03/02/16",
        Amount : "100$",
        Status: "Approved",
        availableStatus : ["Closed"]
    },
    {
        Id: "2",
        Category: "Team Outing",
        Project: "A",
        AddedBy: "Aparna R",
        Date: "03/02/16",
        Amount: "100$",
        Status: "Approved",
        availableStatus: ["Closed" ]
    },
    {
        Id: "3",
        Category: "Team Lunch",
        Project: "A",
        AddedBy: "Aparna M",
        Date: "03/02/16",
        Amount: "100$",
        Status: "Pending",
        availableStatus: ["Approved", "Denied", "Closed" ]
    },
    {
        Id: "4",
        Category: "Bill",
        Project: "A",
        AddedBy: "Aparna S",
        Date: "03/02/16",
        Amount: "100$",
        Status: "Denied",
        availableStatus: ["Approved", "Closed" ]
    }

    ]

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

    $scope.getCategories();
    $scope.getApprovers();
    $scope.getProjects();

    $scope.Open = function (size) {
      
        console.log( "categories",$scope.Categories);
        var myModalInstance = $modal.open({
            animation: true,
            templateUrl: 'addexpenseModal.html',
            controller: 'modalInstanceCntrl',
            size: size,
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
                    }
            }
        });

        myModalInstance.result.then(
            function () {
                //this is called when the modal is closed.
            },
            function () {
                //this is called when the modal is dismissed.
            }
        );
    }

    $scope.goToViewPage = function (expense,i) {
        $location.url('viewExpense');
    }

    $scope.setSelectedStatus = function (e) {
       
        e.stopPropagation();
    }
  
});

smartApp.controller('modalInstanceCntrl', function ($scope, $modalInstance, $http, category, project, approver, onbehalf) {

    $scope.data = {};

    $scope.currencies = [{ name: "INR" }, { name: "$" }, { name: "PLN" }, { name: "£" }];
    $scope.currency = $scope.currencies[0];

    $scope.valuationDate = new Date();
    $scope.valuationDatePickerIsOpen = false;

    $scope.valuationDatePickerOpen = function () {

        $scope.valuationDatePickerIsOpen = true;
    };

    $scope.expenseCategories = category;
    $scope.isAdmin = sessionStorage.getItem("userRole") == "Admin";
    $scope.projects = project;
    $scope.approvers = approver;
    $scope.users = onbehalf;

    $scope.ok = function (valid) {
        $scope.submitted = true;
        if (valid)
        {           
            $modalInstance.close();
        }
      
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});