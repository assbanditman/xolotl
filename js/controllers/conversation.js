(function() {
    "use strict";
    var module = angular.module("XolotlConversation", []);

    module.controller("ConversationController", function($scope, $routeParams, $location, $filter,
        $rootScope, DatabaseService, ColorGenerator) {

        $scope.number = $routeParams.number;
        $scope.messages = [];
        

        DatabaseService.getAllContacts().then(function(contacts) {
            $scope.$apply(function() {
                $scope.contact = $filter("filter")(contacts, {number: $scope.number}, true)[0];
            });
        }, function(error) {
            console.error(error);
        });

        $rootScope.$on("newMessage", function(messageEvent, args) {
            if (args.number === $scope.number) {
                $scope.updateMessages();
            }
        });

        $scope.updateMessages = function() {
            DatabaseService.getAllMessages($scope.number).then(function(results) {
                $scope.$apply(function () {
                    $scope.messages = results;
                });
            }, function(error) {
                console.error(error);
            });
        };
        $scope.updateMessages();

        $scope.contactStyle = function(number) {
            return {
                "background" : ColorGenerator.randomHslString($scope.number)
            };
        };

        $scope.messageStyle = function(number, isSelf) {
            if (isSelf) {
                return {};
            } else {
                return {
                    "border-top" : "1px solid " + ColorGenerator.randomHslString($scope.number)
                };
            }
        };

        $scope.sendMessage = function() {
            var message = {
                number: $scope.number,
                body: $scope.message,
                isSelf: true,
                sentTime: Date.now(),
                status: "success"
            };
            DatabaseService.addMessage(message);
            $scope.message = "";
        };

        $scope.openOptions = function() {
            $location.path("/options/" + $routeParams.number);
        };
    });
})();
