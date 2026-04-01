"use strict";
/// <reference types="angular" />
/// <reference types="angular-route" />
var app = angular.module('bookMySlotApp', ['ngRoute']);
app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
            templateUrl: 'views/slots.html',
            controller: 'SlotsController'
        })
            .when('/my-bookings', {
            templateUrl: 'views/my-bookings.html',
            controller: 'MyBookingsController'
        })
            .when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'AdminController'
        })
            .otherwise({
            redirectTo: '/'
        });
    }]);
app.factory('ApiService', ['$http', function ($http) {
        var baseUrl = '';
        return {
            getSlots: function () { return $http.get("".concat(baseUrl, "/slots")); },
            // POST /slot to create OR update slot depending on _id inclusion
            createOrUpdateSlot: function (data) { return $http.post("".concat(baseUrl, "/slot"), data); }
        };
    }]);
app.controller('SlotsController', ['$scope', 'ApiService', function ($scope, ApiService) {
        $scope.slots = [];
        $scope.loading = true;
        $scope.loadSlots = function () {
            $scope.loading = true;
            ApiService.getSlots().then(function (response) {
                $scope.slots = response.data;
                $scope.loading = false;
            }).catch(function (err) {
                console.error(err);
                $scope.loading = false;
            });
        };
        $scope.bookSlot = function (slot) {
            if (!slot.inputRollNumber) {
                alert('Please enter your roll number to book.');
                return;
            }
            var data = {
                _id: slot._id,
                isAvailable: false,
                bookedBy: slot.inputRollNumber
            };
            slot.bookingInProgress = true;
            ApiService.createOrUpdateSlot(data).then(function (response) {
                slot.isAvailable = false;
                slot.bookedBy = slot.inputRollNumber;
                slot.inputRollNumber = '';
                slot.bookingInProgress = false;
            }).catch(function (err) {
                console.error(err);
                slot.bookingInProgress = false;
                alert('Failed to book slot.');
            });
        };
        $scope.loadSlots();
    }]);
app.controller('MyBookingsController', ['$scope', 'ApiService', function ($scope, ApiService) {
        $scope.myBookings = [];
        $scope.searchRollNumber = '';
        $scope.loading = false;
        $scope.searched = false;
        $scope.fetchMyBookings = function () {
            if (!$scope.searchRollNumber)
                return;
            $scope.loading = true;
            $scope.searched = true;
            ApiService.getSlots().then(function (response) {
                var allSlots = response.data;
                $scope.myBookings = allSlots.filter(function (s) { return s.bookedBy === $scope.searchRollNumber; });
                $scope.loading = false;
            }).catch(function (err) {
                console.error(err);
                $scope.loading = false;
            });
        };
        $scope.cancelBooking = function (slot) {
            if (!confirm('Are you sure you want to cancel this booking?'))
                return;
            var data = {
                _id: slot._id,
                isAvailable: true,
                bookedBy: null
            };
            ApiService.createOrUpdateSlot(data).then(function (response) {
                $scope.myBookings = $scope.myBookings.filter(function (s) { return s._id !== slot._id; });
            }).catch(function (err) {
                console.error(err);
                alert('Failed to cancel booking.');
            });
        };
    }]);
app.controller('AdminController', ['$scope', 'ApiService', function ($scope, ApiService) {
        $scope.slots = [];
        $scope.newSlot = { slotTime: '' };
        $scope.loading = true;
        $scope.loadSlots = function () {
            $scope.loading = true;
            ApiService.getSlots().then(function (response) {
                $scope.slots = response.data;
                $scope.loading = false;
            }).catch(function (err) {
                console.error(err);
                $scope.loading = false;
            });
        };
        $scope.createSlot = function () {
            if (!$scope.newSlot.slotTime)
                return;
            var data = {
                slotTime: $scope.newSlot.slotTime
            };
            ApiService.createOrUpdateSlot(data).then(function (response) {
                $scope.slots.push(response.data);
                $scope.newSlot.slotTime = '';
            }).catch(function (err) {
                console.error(err);
                alert('Failed to create slot.');
            });
        };
        $scope.loadSlots();
    }]);
