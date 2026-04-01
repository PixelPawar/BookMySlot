/// <reference types="angular" />
/// <reference types="angular-route" />

const app = angular.module('bookMySlotApp', ['ngRoute']);

app.config(['$routeProvider', ($routeProvider: angular.route.IRouteProvider) => {
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

app.factory('ApiService', ['$http', ($http: angular.IHttpService) => {
  const baseUrl = '';
  return {
    getSlots: () => $http.get(`${baseUrl}/slots`),
    // POST /slot to create OR update slot depending on _id inclusion
    createOrUpdateSlot: (data: any) => $http.post(`${baseUrl}/slot`, data)
  };
}]);

app.controller('SlotsController', ['$scope', 'ApiService', ($scope: any, ApiService: any) => {
  $scope.slots = [];
  $scope.loading = true;

  $scope.loadSlots = () => {
    $scope.loading = true;
    ApiService.getSlots().then((response: any) => {
      $scope.slots = response.data;
      $scope.loading = false;
    }).catch((err: any) => {
      console.error(err);
      $scope.loading = false;
    });
  };

  $scope.bookSlot = (slot: any) => {
    if (!slot.inputRollNumber) {
      alert('Please enter your roll number to book.');
      return;
    }
    
    const data = {
      _id: slot._id,
      isAvailable: false,
      bookedBy: slot.inputRollNumber
    };
    
    slot.bookingInProgress = true;
    
    ApiService.createOrUpdateSlot(data).then((response: any) => {
      slot.isAvailable = false;
      slot.bookedBy = slot.inputRollNumber;
      slot.inputRollNumber = '';
      slot.bookingInProgress = false;
    }).catch((err: any) => {
      console.error(err);
      slot.bookingInProgress = false;
      alert('Failed to book slot.');
    });
  };

  $scope.loadSlots();
}]);

app.controller('MyBookingsController', ['$scope', 'ApiService', ($scope: any, ApiService: any) => {
  $scope.myBookings = [];
  $scope.searchRollNumber = '';
  $scope.loading = false;
  $scope.searched = false;

  $scope.fetchMyBookings = () => {
    if (!$scope.searchRollNumber) return;
    
    $scope.loading = true;
    $scope.searched = true;
    ApiService.getSlots().then((response: any) => {
      const allSlots = response.data;
      $scope.myBookings = allSlots.filter((s: any) => s.bookedBy === $scope.searchRollNumber);
      $scope.loading = false;
    }).catch((err: any) => {
      console.error(err);
      $scope.loading = false;
    });
  };

  $scope.cancelBooking = (slot: any) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    const data = {
      _id: slot._id,
      isAvailable: true,
      bookedBy: null
    };
    
    ApiService.createOrUpdateSlot(data).then((response: any) => {
      $scope.myBookings = $scope.myBookings.filter((s: any) => s._id !== slot._id);
    }).catch((err: any) => {
      console.error(err);
      alert('Failed to cancel booking.');
    });
  };
}]);

app.controller('AdminController', ['$scope', 'ApiService', ($scope: any, ApiService: any) => {
  $scope.slots = [];
  $scope.newSlot = { slotDate: '', slotDay: '', slotTime: '' };
  $scope.loading = true;

  $scope.loadSlots = () => {
    $scope.loading = true;
    ApiService.getSlots().then((response: any) => {
      $scope.slots = response.data;
      $scope.loading = false;
    }).catch((err: any) => {
      console.error(err);
      $scope.loading = false;
    });
  };

  $scope.createSlot = () => {
    if (!$scope.newSlot.slotDate || !$scope.newSlot.slotDay || !$scope.newSlot.slotTime) return;
    
    const data = {
      slotDate: $scope.newSlot.slotDate,
      slotDay: $scope.newSlot.slotDay,
      slotTime: $scope.newSlot.slotTime
    };
    
    ApiService.createOrUpdateSlot(data).then((response: any) => {
      $scope.slots.push(response.data);
      $scope.newSlot = { slotDate: '', slotDay: '', slotTime: '' };
    }).catch((err: any) => {
      console.error(err);
      alert('Failed to create slot.');
    });
  };

  $scope.loadSlots();
}]);
