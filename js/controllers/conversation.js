(function() {
    "use strict";
    var module = angular.module("XolotlConversation", ["XolotlColorGenerator", "XolotlDataService",
        "XolotlMessageStatus"]);

    module.controller("ConversationController", function($scope, $routeParams, $location, $filter,
        $rootScope, DataService, ColorGenerator, MessageStatus) {

        $scope.number = $routeParams.number;
        $scope.messages = [];

        DataService.getContact($scope.number).then(function(contact) {
            $scope.$apply(function() {
                $scope.contact = contact;
            });
        }, function(error) {
            console.error(error);
        }).then(function() {
            $scope.contact.lastReadMessage = $scope.contact.mostRecentMessage;
            DataService.updateContact($scope.contact);
        });

        $scope.$on("messagesUpdated", function(messageEvent, args) {
            if (args.number === $scope.number) {
                $scope.updateMessages();
            }
        });

        $scope.updateMessages = function() {
            DataService.getAllMessages($scope.number).then(function(results) {
                $scope.$apply(function () {
                    $scope.messages = results;
                });
            }, function(error) {
                console.error(error);
            }).then(function() {
                if ($scope.messages.length > 0) {
                    $scope.contact.mostRecentMessage = $scope.messages[$scope.messages.length - 1].sentTime;
                    $scope.contact.lastReadMessage = $scope.messages[$scope.messages.length - 1].sentTime;
                }
                DataService.updateContact($scope.contact);
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
                status: MessageStatus.SAVED
            };
            DataService.addMessage(message);
            $scope.message = "";
        };

        $scope.openOptions = function() {
            $location.path("/options/" + $routeParams.number);
            return false;
        };
    });
})();
