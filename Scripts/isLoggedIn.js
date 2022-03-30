/*
Name: Arsalan Arif Radhu. Sanjivkumar Patel
Date: March 29 2022
WEBD6201 Lab3
*/
"use strict";

(() =>{
    // check if the user is already logged in
    if(sessionStorage.getItem("user"))
    {
    // redirect to the secure area
    location.href = "contact-list.html";
    }
})();
