﻿smartApp.service('ExpenseService', function ($q, $http, $firebaseObject, $firebaseArray) {
   // var dataObj = {};
    return {
        getExpenseCategory: function () {
            return $firebaseArray(new Firebase(fibeBaseUrl + 'ExpenseCategory'));
        },
        getExpenseData: function () {
            //return $firebaseArray(new Firebase(fibeBaseUrl + 'Expense'));
            return $http.get('/api/save')
            .success(function(data) {
               console.log(data);
               return data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        },
        getRole: function () {
            return $firebaseObject(new Firebase(fibeBaseUrl + 'Role'));
        },
        setExpenseData: function (dataObj, Upload, expId, expFiles) {
            /*var deferred = $q.defer();
          
            var fb = new Firebase(fibeBaseUrl + 'Expense');
            console.log("FB object", dataObj);
            var onComplete = function (error) {
                if (error) {
                    console.log('Synchronization to FB failed');
                    deferred.reject(error);   // return;
                } else {
                    console.log('Synchronization to FB succeeded');
                    if (!angular.isUndefined(expFiles)) {
                        Upload.base64DataUrl(expFiles).then(function (base64Urls) {
                           var newdataObj = angular.extend({}, dataObj, { Invoice: base64Urls[0] });
                           console.log("FB object mod", newdataObj);
                           fb.child(expId).set(newdataObj, function (error) {
                                if (error) {
                                    console.log("Error:", error);
                                    deferred.reject(error);    // return;
                                }
                                else {
                                    deferred.resolve(expId);
                                }

                            });

                        });
                    }
                    else
                    {
                        deferred.resolve(expId);
                    }
                }
            };

            fb.child(expId).set(dataObj, onComplete);
            return deferred.promise;*/
            console.log("file from server",expFiles);
            dataObj.file = expFiles;
           return $http.post('/api/save', dataObj)
            .success(function(data) {
               console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        }, getExpenseById: function (expId) {
            /*var ref = new Firebase(fibeBaseUrl + 'Expense');
            return $firebaseObject(ref.child(expId));*/
            return $http.get('/api/save/'+ expId)
            .success(function(data) {
               return data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        },
        changeApprovalStatus: function (expId, status) {

            /*var deferred = $q.defer();
            var fb = new Firebase(fibeBaseUrl + 'Expense');
            fb.child(expId).update({ ApprovalStatusId: status.id, ApprovalStatus: status.value }, onComplete);
            var onComplete = function (error) {
                if (error) {
                    console.log('Change status to FB failed');
                    deferred.reject(error);
                }
                else {
                    console.log('Change status to FB succeeded');
                    deferred.resolve(expId);
                }
            }

            return deferred.promise;*/
            return $http.put('/api/updateStatus/'+ expId,status)
            .success(function(data) {
               return data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        },
        updateStatus: function (expenseID, approvalStatusId, approvalStatus) {
            /*var fb = new Firebase(fibeBaseUrl + 'Expense/' + expenseID);
            fb.update({ ApprovalStatusId: approvalStatusId, ApprovalStatus: approvalStatus });
            return $firebaseObject(fb.child(expenseID));*/
            var status = {};
            status.approvalStatusId = approvalStatusId,
            status.approvalStatus = approvalStatus;
            return $http.put('/api/updateStatus/'+ expenseID,status)
            .success(function(data) {
               return data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        },
        updateExpenseDetails: function (dataObj, Upload, expId, expFiles) {
            /*var deferred = $q.defer();

            var fb = new Firebase(fibeBaseUrl + 'Expense');
            console.log("FB object", dataObj);
            var onComplete = function (error) {
                if (error) {
                    console.log('Synchronization to FB failed');
                    deferred.reject(error);   // return;
                } else {
                    console.log('Synchronization to FB succeeded');
                    if (!angular.isUndefined(expFiles)) {
                        Upload.base64DataUrl(expFiles).then(function (base64Urls) {
                            var newdataObj = angular.extend({}, dataObj, { Invoice: base64Urls[0] });
                            console.log("FB object mod", newdataObj);
                            fb.child(expId).update(newdataObj, function (error) {
                                if (error) {
                                    console.log("Error:", error);
                                    deferred.reject(error);    // return;
                                }
                                else {
                                    deferred.resolve(expId);
                                }

                            });

                        });
                    }
                    else {
                        deferred.resolve(expId);
                    }
                }
            };

            fb.child(expId).update(dataObj, onComplete);
            return deferred.promise;*/
            return $http.put('/api/update/'+ expId,dataObj)
            .success(function(data) {
               return data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        },
        updateHistory: function (expenseID, historyDetails) {
            /*var fb = new Firebase(fibeBaseUrl + 'ExpenseHistory');*/
            console.log(historyDetails);
            /*fb.child(expenseHistoryId).set(historyDetails);
            return $firebaseObject(fb.child(expenseHistoryId));*/
            return $http.post('/api/history/'+expenseID,historyDetails)
            .success(function(data) {
               console.log(data);
               return data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        },
        getExpenseHistory: function (expenseId) {
            return $http.get('/api/history/'+expenseId)
            .success(function(data) {
               console.log(data);
               return data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
            //return $firebaseArray(new Firebase(fibeBaseUrl + 'ExpenseHistory'));
        }


    }
        
});
