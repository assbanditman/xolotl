(function() {
    "use strict";
    var module = angular.module("XolotlConversation", []);

    module.controller("ConversationController", function($scope, $routeParams, $location, ConversationService,
        ContactsService, ColorGenerator) {

        console.log($routeParams.number);

        $scope.number = $routeParams.number;

        $scope.contact = ContactsService.getContact($scope.number);

        $scope.messages = ConversationService.getConversation($scope.number);

        $scope.contactStyle = function(number) {
            return {
                "background" : ColorGenerator.randomHslString(number)
            };
        };

        $scope.messageStyle = function(number, isSelf) {
            if (isSelf) {
                return {};
            } else {
                return {
                    "border-top" : "1px solid " + ColorGenerator.randomHslString(number)
                };
            }
        };

        $scope.sendMessage = function() {
            ConversationService.addMessage($scope.number, $scope.message, true);
            $scope.message = "";
        };

        $scope.openOptions = function() {
            $location.path("/options/" + $routeParams.number);
        };
    });
})();
