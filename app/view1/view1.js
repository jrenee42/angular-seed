'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

    .controller('View1Ctrl', ['$scope', '$http',function($scope, $http) {

        //TODO:  /sortable headers
         //filter for searching
        //validation:  name cannot be empty
        //email cannot be empty
        //email must be valid
        //remove views/navbar
        

        var baseUrl = 'http://localhost:3001/users';
        var toggleConfirmationDialog = dialogFactory("confirmation-dialog");
        var toggleEditingDialog = dialogFactory("edit-dialog");
        
        $http.get(baseUrl)
            .success(function (response) {
                $scope.users = response;
            });
        
        
        $scope.maybeDelete = function(id, name) {
            console.log('would pop up a dialog here to deletion......', id);
            showConfirmationDialog(id, name);
        };


        //confirmation dialog:
        $scope.confirmationDialogConfig = {
            title: "Deletion Confirmation"
        };


        $scope.showAddUserDialog = function() {
            console.log('ack');
            
            $scope.editDialogConfig = {
                title: "Add New User",
            };
            
            toggleEditingDialog(true);
        };
            

        $scope.editUser = function(userId, name, email) {

            $scope.editDialogConfig = {
                title: "Edit User: " + name,
                editing: true,
                name: name,
                email: email,
                id: userId,
            };
            
            toggleEditingDialog(true);
        };


        $scope.doEditing = function() {
            let data = {
                name: $scope.editDialogConfig.name,
                email: $scope.editDialogConfig.email,
            };

            var url = baseUrl + "/" + $scope.editDialogConfig.id;

            $http.patch(url, data).success(response => {
                console.log("got successful response: " , response);

                //replace the old enttry with that new entry that was just returned:

                $scope.users = $scope.users.map(user => {
                    if (user.id === $scope.editDialogConfig.id) {
                        return response;
                    }
                    return user;
                });

                //close the dialog
                toggleEditingDialog();
                
            }).catch(err => {
                console.log('bad patch..... error...', err);
            });
        };

        
        $scope.addNewUser = function() {
            let data = {
                name: $scope.editDialogConfig.name,
                email: $scope.editDialogConfig.email,
            };

            $http.post(baseUrl, data).success(response => {
                console.log("got successful response: " , response);

                //add the new entry
                $scope.users.push(response);

                //close the dialog
                toggleEditingDialog();
                
            }).catch(err => {
                console.log('bad post..... error...', err);
            });
        };
        
        
        function showConfirmationDialog(userId, name) {
            $scope.confirmationDialogConfig.message  = "Are you sure you want to delete the user: " + name + "?";
            $scope.confirmationDialogConfig.userId = userId;
            toggleConfirmationDialog(true);
        };

        $scope.doDeletion = function(userId){
            $http.delete(baseUrl + "/" + userId).success(function(resp){

                //need to refresh the table:
                //  we know it's successful, so we don't have to requery the server,
                //  can just remove the deleted element locally:
                
                $scope.users = $scope.users.filter(user => {
                   return user.id !== userId;
                });

                toggleConfirmationDialog();
                
            }).catch(function(err){
                console.log('error...', err);
            });
        };

        $scope.delete = function() {
            console.log("Deleting...");
            $scope.showDialog();
        };

        function dialogFactory(id) {
            var showFn = function(flag) {
                 jQuery("#" + id + " .modal").modal(flag ? 'show' : 'hide');
            };
            return showFn;
        }
        
        
    }])

.controller('headerController', function($scope) {
    //here for the showUp/showDown to have a place to be 'called' from; all done via isolate scope
})

    .directive('myHeader', function() {
    
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            'showUp': '&',
            'showDown': '&'
        },
        controller: 'headerController',
        controllerAs: 'header',
        bindToController: true,
        template: '<a href="#">' +
            '<ng-transclude> </ng-transclude> ' +
            '<span ng-show="header.showUp()" class="fa fa-caret-up"></span> ' +
            '<span ng-show="header.showDown()" class="fa fa-caret-down"></span> ' +
            '</a>'
    };
    });


