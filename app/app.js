'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', []);

app.controller('View1Ctrl', ['$scope', '$http',function($scope, $http) {

    //TODO:
    //show error messages to the user
    
    //style the headers
    //validation:  name cannot be empty (done)
    //email cannot be empty (done)
    //email must be valid (done)
    //remove views/navbar (done)
    //filter for searching (done)
    
    var baseUrl = 'http://localhost:3001/users';
    var toggleConfirmationDialog = dialogFactory("confirmation-dialog");
    var toggleEditingDialog = dialogFactory("edit-dialog");
    var toggleMessageDialog = dialogFactory("message-dialog");


    $scope.sortType     = 'id'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order
    
    $scope.doSorting = function(colKey) {
        //if previous click was this col, then reverse the sorting
        //if previous click was NOT this col, then set reverse to false
        if ($scope.sortType === colKey) {
            $scope.sortReverse = !$scope.sortReverse;
        } else {
            $scope.sortReverse = false;
            $scope.sortType = colKey;
        }
    };


    // return true if the arrow for the direction and the column (noted by sortKey) should be shown;
    // else false
    $scope.showArrow= function(direction, sortKey){
        if (direction){
            //ascending
            return   $scope.sortType === sortKey && !$scope.sortReverse;
        } else {
            //descending
            return  $scope.sortType === sortKey && $scope.sortReverse;
        }
    };

    
    $scope.cols = [
        { "display": "ID",
          "sortKey": "id"},
        { "display": "Name",
          "sortKey": "name"},
        { "display": "Email",
          "sortKey": "email"},
        { "display": "Actions"}];

    
    $http.get(baseUrl)
        .success(function (response) {
            $scope.users = response;
        });
    
    
    $scope.maybeDelete = function(id, name) {
        showConfirmationDialog(id, name);
    };


    //confirmation dialog:
    $scope.confirmationDialogConfig = {
        title: "Deletion Confirmation"
    };


    $scope.setToDirty = function(whichField){        
        $scope.userForm[whichField].$setDirty();
    };

    function showErrorMessage(title, message) {
        $scope.msgDialogConfig = {title:title, msg: message};
        toggleMessageDialog(true);
    };
    
    $scope.showAddUserDialog = function() {
        
        $scope.editDialogConfig = {
            title: "Add New User",
            name: "",
            email: "",
            editing: false,
        };

        
        $scope.userForm.$setPristine();
        
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

    $scope.maybeSubmit = function() {
        if ($scope.editDialogConfig.editing){
            $scope.doEditing();
        } else {
            $scope.doEditing(true);
        }
    };

    
    $scope.doEditing = function(newUser) {
        if (!$scope.userForm.$valid) {
            //need to set the fields to dirty; that is what matters in this form:
            $scope.setToDirty('email');
            $scope.setToDirty('fullname');
            return;
        }
        if (newUser){
            addNewUser();
        } else {
            editExistingUser();
        }
    };

    function editExistingUser() {
        
        let data = {
            name: $scope.editDialogConfig.name,
            email: $scope.editDialogConfig.email,
        };

        let url = baseUrl + "/" + $scope.editDialogConfig.id;

        $http.patch(url, data).success(response => {
            console.log("got successful response: " , response);

            //replace the old entry with that new entry that was just returned:

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
            // show message to user; then close dialog
            let msg = "editing the user: " + name + " failed.";

            //close the editing dialog, only one dialog can show at a time:
            toggleEditingDialog();

            showErrorMessage("Error: Editing Failed", msg);
        });
    }


    
    function addNewUser() {
        
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
            //show message to user; then close dialog
            let msg  = "Unable to create the user " + data.name + " with email: " + data.email;

            //close the dialog; only one can be open at once
            toggleEditingDialog();

            showErrorMessage("Error: User Creation Failed", msg);
        });
    }
    
    
    function showConfirmationDialog(userId, name) {
        $scope.confirmationDialogConfig.message  = "Are you sure you want to delete the user: " + name + "?";
        $scope.confirmationDialogConfig.userId = userId;
        $scope.confirmationDialogConfig.name = name;
        toggleConfirmationDialog(true);
    };

    $scope.doDeletion = function(userId, name){
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
            //show message to user, then close dialog

            let msg = "Deletion of the user: " + name + " failed."; 
            //close the deletion dialog, only one dialog can show at a time:
            toggleConfirmationDialog();

            showErrorMessage("Error: Deletion Failed", msg);
            
        });
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
        //may need to change link if don't use view1..........
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
    })

    .directive('jrsEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.jrsEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    });

