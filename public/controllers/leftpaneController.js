smartApp.controller('LeftpaneController', function ($scope) {
    $scope.LoginName = sessionStorage.getItem("loginName");
})