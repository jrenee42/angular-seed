'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

    .controller('View1Ctrl', ['$scope', '$http',function($scope, $http) {
        $scope.hello='hello from jill 2';


$http.get('http://localhost:3001/users')
        .success(function (response) {
            $scope.users = response;
        });
        

}]);
