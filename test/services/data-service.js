describe("db-service", function() {
    beforeEach(module('XolotlDataService', function($provide) {
        $provide.value("dbName", "test");
        $provide.service("TextSecureService", function () {
            this.sendMessage = sinon.stub().returns(Promise.resolve());
        });
    }));

    var service;
    var dbService;
    var textService;
    var rootScope;
    var messageStatus;

    beforeEach(inject(function(DataService, DatabaseService, TextSecureService, $rootScope, MessageStatus) {
        service = DataService;
        dbService = DatabaseService;
        textService = TextSecureService;
        rootScope = $rootScope;
        messageStatus = MessageStatus;
    }));

    afterEach(function() {
        return dbService.deleteDatabase();
    });
    
    describe("Contacts", function() {
        it("returns an empty array if the database is empty", function() {
            return service.getAllContacts().then(function(contacts) {
                assert.deepEqual(contacts, [], "should be empty");
            });
        });
        it("returns a single contact", function() {
            return service.addContact({
                number: "1234",
                name: "Bob"
            }).then(function() {
                return service.getAllContacts();
            }).then(function(contacts) {
                assert.deepEqual(contacts, [{
                    number: "1234",
                    name: "Bob"
                }]);
            });
        });
        it("get a single contact", function() {
            return service.addContact({
                number: "1234",
                name: "Bob"
            }).then(function() {
                return service.addContact({
                    number: "123",
                    name: "Alice"
                });
            }).then(function() {
                return service.getContact("123");
            }).then(function(contact) {
                assert.deepEqual(contact, {
                    number: "123",
                    name: "Alice"
                });
            });
        });
        it("returns multiple contacts", function() {
            return service.addContact({
                number: "1234",
                name: "Bob"
            }).then(function() {
                return service.addContact({
                    number: "123",
                    name: "Alice"
                });
            }).then(function() {
                return service.getAllContacts();
            }).then(function(contacts) {
                var set = _.sortBy(contacts, "name");
                assert.deepEqual(set, [{
                    number: "123",
                    name: "Alice"
                }, {
                    number: "1234",
                    name: "Bob"
                }]);
            });
        });
        it("deletes single contact", function() {
            return service.addContact({
                number: "1234",
                name: "Bob"
            }).then(function() {
                return service.addContact({
                    number: "123",
                    name: "Alice"
                });
            }).then(function() {
                return service.deleteContact("123");
            }).then(function() {
                return service.getAllContacts();
            }).then(function(contacts) {
                assert.deepEqual(contacts, [{
                    number: "1234",
                    name: "Bob"
                }]);
            });
        });
        it("update a specific contact", function() {
            return service.addContact({
                number: "1234",
                name: "Bob"
            }).then(function() {
                return service.addContact({
                    number: "123",
                    name: "Alice"
                });
            }).then(function() {
                return service.updateContact({
                    number: "1234",
                    name: "Jane"
                });
            }).then(function() {
                return service.getAllContacts();
            }).then(function(contacts) {
                var set = _.sortBy(contacts, "name");
                assert.deepEqual(set, [{
                    number: "123",
                    name: "Alice"
                }, {
                    number: "1234",
                    name: "Jane"
                }]);
            });
        });
        it("add using update", function() {
            return service.updateContact({
                number: "1234",
                name: "Bob"
            }).then(function() {
                return service.getAllContacts();
            }).then(function(contacts) {
                assert.deepEqual(contacts, [{
                    number: "1234",
                    name: "Bob"
                }]);
            });
        });
        it("add contact twice fails", function() {
            return service.addContact({
                number: "123",
                name: "Bob"
            }).then(function() {
                return service.addContact({
                    number: "123",
                    name: "Alice"
                });
            }).then(function() {
                assert.fail("promise succeeded");
            }, function(error) {
                // should fail!
            });
        });
        it("getAllContactsByLatestMessage returns contacts that are in order of mostRecentMessage", function() {
            return service.addContact({
                number: "123",
                name: "Bob",
                mostRecentMessage: 2
            }).then(function() {
                return service.addContact({
                    number: "1234",
                    name: "Alice",
                    mostRecentMessage: 1
                });
            }).then(function() {
                return service.getAllContactsByLatestMessage();
            }).then(function(contacts) {
                assert.deepEqual(contacts, [{
                    number: "123",
                    name: "Bob",
                    mostRecentMessage: 2
                }, {
                    number: "1234",
                    name: "Alice",
                    mostRecentMessage: 1
                }]);
            });
        });
    });
    describe("Messages", function() {
        var num = "123";
        it("returns an empty array if the database is empty", function() {
            return service.getAllMessages(num).then(function(contacts) {
                assert.deepEqual(contacts, [], "should be empty");
            });
        });
        it("returns a single message", function() {
            return service.addMessage({
                number: num,
                body: "hello person",
                isSelf: true,
                sentTime: 12345,
                status: messageStatus.SENT
            }).then(function() {
                return service.getAllMessages(num);
            }).then(function(messages) {
                assert.deepEqual(messages, [{
                    number: num,
                    body: "hello person",
                    isSelf: true,
                    sentTime: 12345,
                    status: messageStatus.SENT
                }]);
            });
        });
        it("add message should update status", function() {
            return service.addMessage({
                number: num,
                body: "hello person",
                isSelf: true,
                sentTime: 12345,
                status: messageStatus.SAVED
            }).then(function() {
                return service.getAllMessages(num);
            }).then(function(messages) {
                assert.ok(messages[0].status === messageStatus.SENT);
            });
        });
        it("add message should produce notification events", function() {
            sinon.spy(rootScope, "$broadcast");
            return service.addMessage({
                number: num,
                body: "hello person",
                isSelf: true,
                sentTime: 12345,
                status: messageStatus.SAVED
            }).then(function() {
                sinon.assert.calledTwice(rootScope.$broadcast);
            });
        });
        it("add message should update status if sending failed", function() {
            textService.sendMessage.returns(Promise.reject());
            return service.addMessage({
                number: num,
                body: "hello person",
                isSelf: true,
                sentTime: 12345,
                status: messageStatus.SAVED
            }).then(function() {
                return service.getAllMessages(num);
            }).then(function(messages) {
                assert.deepEqual(messages, [{
                    number: num,
                    body: "hello person",
                    isSelf: true,
                    sentTime: 12345,
                    status: messageStatus.FAILED
                }]);
            });
        });
        it("adding a message calls text secure", function() {
            return service.addMessage({
                number: num,
                body: "hello person",
                isSelf: true,
                sentTime: 12345,
                status: messageStatus.SENT
            }).then(function() {
                sinon.assert.calledOnce(textService.sendMessage);
            });
        });
        it("returns multiple messages", function() {
            return service.addMessage({
                number: num,
                body: "hello person",
                isSelf: true,
                sentTime: 12345,
                status: messageStatus.SAVED
            }).then(function() {
                return service.addMessage({
                    number: num,
                    body: "hallo",
                    isSelf: false,
                    sentTime: 12346,
                    status: messageStatus.SAVED
                });
            }).then(function() {
                return service.getAllMessages(num);
            }).then(function(messages) {
                var set = _.sortBy(messages, "sentTime");
                assert.deepEqual(set, [{
                    number: num,
                    body: "hello person",
                    isSelf: true,
                    sentTime: 12345,
                    status: messageStatus.SENT
                }, {
                    number: num,
                    body: "hallo",
                    isSelf: false,
                    sentTime: 12346,
                    status: messageStatus.SENT
                }]);
            });
        });
        it("deletes multiple message", function() {
            return service.addMessage({
                number: num,
                body: "hello person",
                isSelf: true,
                sentTime: 12345,
                status: messageStatus.SENT
            }).then(function() {
                return service.addMessage({
                    number: num,
                    body: "hallo",
                    isSelf: false,
                    sentTime: 12346,
                    status: messageStatus.SENT
                });
            }).then(function() {
                return service.addMessage({
                    number: "999",
                    body: "other",
                    isSelf: false,
                    sentTime: 12347,
                    status: messageStatus.SENT
                });
            }).then(function() {
                return service.deleteMessages(num);
            }).then(function() {
                return service.getAllMessages("999");
            }).then(function(messages) {
                var set = _.sortBy(messages, "sentTime");
                assert.deepEqual(set, [{
                    number: "999",
                    body: "other",
                    isSelf: false,
                    sentTime: 12347,
                    status: messageStatus.SENT
                }]);
            }).then(function() {
                return service.getAllMessages(num);
            }).then(function(messages) {
                assert.deepEqual([], messages);
            });
        });
    });
    describe("Config", function() {
        it("gets default config if there is no config", function() {
            return service.getGeneralItem("notificationsEnabled").then(function(config) {
                assert.ok(config);
            });
        });
    });
});