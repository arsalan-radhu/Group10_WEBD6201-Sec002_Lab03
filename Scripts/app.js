/*
Name: Arsalan Arif Radhu. Sanjivkumar Patel
Date: March 29 2022
WEBD6201 Lab3
*/
"use strict";

((core) => {

  /**
   *Adds the mouse events to the nav bar links
   *
   */
  function addLinkEvents() {
    $("ul>li>a").off("click");
    $("ul>li>a").off("mouseover");
    $("ul>li>a").on("click", function () {
      loadLink($(this).attr("id"));
    });
    $("ul>li>a").on("mouseover", function () {
      $(this).css("cursor", "pointer");
    });
  }

  /**
   *Highlights the active link
   *
   * @param {string} link
   */
  function highlightActiveLink(link) {
    $(`#${router.ActiveLink}`).removeClass("active");
    if (link == "logout") {
      sessionStorage.clear();
      router.ActiveLink = "login";
    } else {
      router.ActiveLink = link;
    }
    $(`#${router.ActiveLink}`).addClass("active");
  }

  /**
   *
   *This function switches page content relative to the link that is passed into the function 
   optionally, the link data can be also be passed 
   * @param {string} link
   * @param {string} [data=""]
   */
  function loadLink(link, data = "") {
    highlightActiveLink(link);
    router.LinkData = data;
    loadContent(router.ActiveLink, ActiveLinkCallBack(router.ActiveLink));
    history.pushState({}, "", router.ActiveLink);
  }

  /**
   * Inject the Navigation bar into the Header element and highlight the active link based on the pageName parameter
   *
   * @param {string} pageName
   */
  function loadHeader(pageName) {
    // inject the Header
    $.get("./Views/components/header.html", function (data) {
      $("header").html(data); // load the navigation bar

      toggleLogin(); // add login / logout and secure links

      $(`#${pageName}`).addClass("active"); // highlight active link
      addLinkEvents();
    });
  }

  /**
   * Inject page content in the main element
   *
   * @param {string} pageName
   * @param {function} callback
   * @returns {void}
   */
  function loadContent(pageName, callback) {
    // inject content
    $.get(`./Views/content/${pageName}.html`, function (data) {
      $("main").html(data);
      toggleLogin();

      callback();
    });
  }

  /**
   *This function loads the page footer
   *
   */
  function loadFooter() {
    // inject the Footer
    $.get("./Views/components/footer.html", function (data) {
      $("footer").html(data);
    });
  }

  function displayHome() {}

  function displayAbout() {}

  function displayProjects() {}

  function displayServices() {}

  /**
   *This function test the users full name for validity
   *
   */
  function testFullName() {
    let messageArea = $("#messageArea").hide();
    let fullNamePattern = /([A-Z][a-z]{1,25})+(\s|,|-)([A-Z][a-z]{1,25})+(\s|,|-)*/;

    $("#fullName").on("blur", function () {
      if (!fullNamePattern.test($(this).val())) {
        $(this).trigger("focus").trigger("select");
        messageArea
          .show()
          .addClass("alert alert-danger")
          .text(
            "Please enter a valid Full Name. This must include at least a Capitalized first name followed by a Capitlalized last name."
          );
      } else {
        messageArea.removeAttr("class").hide();
      }
    });
  }

  /**
   * This function tests the inputted contact number for validity
   */
  function testContactNumber() {
    let messageArea = $("#messageArea");
    let contactNumberPattern = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

    $("#contactNumber").on("blur", function () {
      if (!contactNumberPattern.test($(this).val())) {
        $(this).trigger("focus").trigger("select");
        messageArea
          .show()
          .addClass("alert alert-danger")
          .text(
            "Please enter a valid Contact Number. Country code and area code are both optional"
          );
      } else {
        messageArea.removeAttr("class").hide();
      }
    });
  }

  /**
   *This function tests the inputted email address for validity
   *
   */
  function testEmailAddress() {
    let messageArea = $("#messageArea");
    let emailAddressPattern = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;

    $("#emailAddress").on("blur", function () {
      if (!emailAddressPattern.test($(this).val())) {
        $(this).trigger("focus").trigger("select");
        messageArea
          .show()
          .addClass("alert alert-danger")
          .text("Please enter a valid Email Address.");
      } else {
        messageArea.removeAttr("class").hide();
      }
    });
  }

  /**
   *This function calls the validation functions to validate full name, contact number, and email address.
   *
   */
  function formValidation() {
    testFullName();
    testContactNumber();
    testEmailAddress();
  }

  /**
   *This function displays the contact page
   *
   */
  function displayContact() {
    // form validation
    formValidation();

    $("#sendButton").on("click", (event) => {
      if ($("#subscribeCheckbox")[0].checked) {
        let contact = new core.Contact(
          fullName.value,
          contactNumber.value,
          emailAddress.value
        );

        if (contact.serialize()) {
          let key = contact.FullName.substring(0, 1) + Date.now();

          localStorage.setItem(key, contact.serialize());
        }
      }
    });
  }

  /**
   *This function displays the contact list page
   *
   */
  function displayContactList() {
    // don't allow visitors to go here
    authGuard();

    if (localStorage.length > 0) {
      let contactList = document.getElementById("contactList");

      let data = "";

      let keys = Object.keys(localStorage);

      let index = 1;

      for (const key of keys) {
        let contactData = localStorage.getItem(key);

        let contact = new core.Contact();
        contact.deserialize(contactData);

        data += `<tr>
          <th scope="row" class="text-center">${index}</th>
          <td>${contact.FullName}</td>
          <td>${contact.ContactNumber}</td>
          <td>${contact.EmailAddress}</td>
          <td class="text-center"><button value="${key}" class="btn btn-primary btn-sm edit"><i class="fas fa-edit fa-sm"></i> Edit</button></td>
          <td class="text-center"><button value="${key}" class="btn btn-danger btn-sm delete"><i class="fas fa-trash-alt fa-sm"></i> Delete</button></td>
          </tr>`;

        index++;
      }

      contactList.innerHTML = data;

      $("button.edit").on("click", function () {
        loadLink("edit", $(this).val().toString());
      });

      $("button.delete").on("click", function () {
        if (confirm("Are you sure?")) {
          localStorage.removeItem($(this).val());
        }
        loadLink("contact-list"); // refresh the page
      });

      $("#addButton").on("click", function () {
        loadLink("edit");
      });
    }
  }

  /**
   *This function displays the edit page
   *
   */
  function displayEdit() {
    let key = router.LinkData;

    let contact = new core.Contact();

    // check to ensure that the key is not empty
    if (key != "") {
      // get contact info from localStorage
      contact.deserialize(localStorage.getItem(key));

      // display contact information in the form
      $("#fullName").val(contact.FullName);
      $("#contactNumber").val(contact.ContactNumber);
      $("#emailAddress").val(contact.EmailAddress);
    } else {
      // modify the page so that it shows "Add Contact" in the header
      $("main>h1").text("Add Contact");
      // modify edit button so that it shows "Add" as well as the appropriate icon
      $("#editButton").html(`<i class="fas fa-plus-circle fa-lg"></i> Add`);
    }

    // form validation
    formValidation();

    $("#editButton").on("click", function () {
      // check to see if key is empty
      if (key == "") {
        // create a new key
        key = contact.FullName.substring(0, 1) + Date.now();
      }

      // copy contact info from form to contact object
      contact.FullName = $("#fullName").val();
      contact.ContactNumber = $("#contactNumber").val();
      contact.EmailAddress = $("#emailAddress").val();

      // add the contact info to localStorage
      localStorage.setItem(key, contact.serialize());

      // return to the contact list
      loadLink("contact-list");
    });

    $("#cancelButton").on("click", function () {
      // return to the contact list
      loadLink("contact-list");
    });
  }

  /**
   * Processes the Login and performs validation
   */
  function performLogin() {
    let messageArea = $("#messageArea");
    messageArea.hide();

    let username = $("#username");
    let password = $("#password");
    let success = false;
    let newUser = new core.User();

    // use ajax to access the json file
    $.get("./Data/users.json", function (data) {
      // check each user in the users.json file  (linear search)
      for (const user of data.users) {
        if (
          username.val() == user.Username &&
          password.val() == user.Password
        ) {
          newUser.fromJSON(user);
          success = true;
          break;
        }
      }

      // if username and password matches - success... then perform login
      if (success) {
        // add user to session storage
        sessionStorage.setItem("user", newUser.serialize());

        // hide any error message
        messageArea.removeAttr("class").hide();

        // redirect user to secure area - contact-list.html
        loadLink("task-list");
      } else {
        // display an error message
        username.trigger("focus").trigger("select");
        messageArea
          .show()
          .addClass("alert alert-danger")
          .text("Error: Invalid login information");
      }
    });
  }

  /**
   * Displays and Processes the Login page
   */
  function displayLogin() {
    $("#loginButton").on("click", function () {
      performLogin();
    });

    $("#password").on("keypress", function (event) {
      if (event.key == "Enter") {
        performLogin();
      }
    });

    $("#cancelButton").on("click", function () {
      // clear the login form
      document.forms[0].reset();
      // return to the home page
      loadLink("home");
    });
  }

  function displayRegister() {}

  /**
   *This function toggles the login button to logout and adds the contact list and task list links to the nav bar
   *
   */
  function toggleLogin() {
    let contactListLink = $("#contactListLink")[0];
    let taskListLink = $("#task-listLink")[0];
    if (sessionStorage.getItem("user")) {
      $("#loginListItem").html(
        `<a id="logout" class="nav-link" aria-current="page"><i class="fas fa-sign-out-alt"></i> Logout</a>`
      );

      if (!contactListLink) {
        $(`<li id="contactListLink" class="nav-item">
        <a id="contact-list" class="nav-link" aria-current="page"><i class="fas fa-users fa-lg"></i> Contact List</a>
      </li>`).insertBefore("#loginListItem");
      }

      if (!taskListLink) {
        $(`<li id="task-listLink" class="nav-item">
            <a id="task-list" class="nav-link" aria-current="page"><i class="fas fa-list-ul fa-lg"></i> Task List</a>
          </li>`).insertBefore("#loginListItem");
      }
    } else {
      $("#loginListItem").html(
        `<a id="login" class="nav-link" aria-current="page"><i class="fas fa-sign-in-alt"></i> Login</a>`
      );

      if (contactListLink) {
        $("#contactListLink").remove();
      }

      if (taskListLink) {
        $("#task-listLink").remove();
      }
    }
    addLinkEvents();
    highlightActiveLink(router.ActiveLink);
  }

  /**
   *This function stops a non logged in user from entering locked pages
   *
   */
  function authGuard() {
    if (!sessionStorage.getItem("user")) {
      // redirect back to login page
      loadLink("login");
    }
  }

  function display404() {}

  /**
   *This function associates and returns a related callback to a route
   *
   * @param {string} activeLink
   * @return {function} 
   */
  function ActiveLinkCallBack(activeLink) {
    switch (activeLink) {
      case "home":
        return displayHome;
      case "about":
        return displayAbout;
      case "projects":
        return displayProjects;
      case "services":
        return displayServices;
      case "contact":
        return displayContact;
      case "contact-list":
        return displayContactList;
      case "edit":
        return displayEdit;
      case "login":
        return displayLogin;
      case "register":
        return displayRegister;
      case "task-list":
        return DisplayTaskList;
      case "404":
        return display404;
        case "/":
          return displayHome;
      default:
        console.error("ERROR: callback does not exist: " + activeLink);
        break;
    }
  }

  /**
   * This function adds a new Task to the TaskList
   */
  function AddNewTask() {
    let messageArea = $("#messageArea");
    messageArea.hide();
    let taskInput = $("#taskTextInput");

    if (taskInput.val() != "" && taskInput.val().charAt(0) != " ") {
      let newElement = `
              <li class="list-group-item" id="task">
              <span id="taskText">${taskInput.val()}</span>
              <span class="float-end">
                  <button class="btn btn-outline-primary btn-sm editButton"><i class="fas fa-edit"></i>
                  <button class="btn btn-outline-danger btn-sm deleteButton"><i class="fas fa-trash-alt"></i></button>
              </span>
              <input type="text" class="form-control edit-task editTextInput">
              </li>
              `;
      $("#taskList").append(newElement);
      messageArea.removeAttr("class").hide();
      taskInput.val("");
    } else {
      taskInput.trigger("focus").trigger("select");
      messageArea
        .show()
        .addClass("alert alert-danger")
        .text("Please enter a valid Task.");
    }
  }

  /**
   * This function is the Callback function for the TaskList
   *
   */
  function DisplayTaskList() {
    authGuard();
    let messageArea = $("#messageArea");
    messageArea.hide();
    let taskInput = $("#taskTextInput");

    // add a new Task to the Task List
    $("#newTaskButton").on("click", function () {
      AddNewTask();
    });

    taskInput.on("keypress", function (event) {
      if (event.key == "Enter") {
        AddNewTask();
      }
    });

    // Edit an Item in the Task List
    $("ul").on("click", ".editButton", function () {
      let editText = $(this).parent().parent().children(".editTextInput");
      let text = $(this).parent().parent().text();
      editText.val(text).show().trigger("select");
      editText.on("keypress", function (event) {
        if (event.key == "Enter") {
          if (editText.val() != "" && editText.val().charAt(0) != " ") {
            editText.hide();
            $(this).parent().children("#taskText").text(editText.val());
            messageArea.removeAttr("class").hide();
          } else {
            editText.trigger("focus").trigger("select");
            messageArea
              .show()
              .addClass("alert alert-danger")
              .text("Please enter a valid Task.");
          }
        }
      });
    });

    // Delete a Task from the Task List
    $("ul").on("click", ".deleteButton", function () {
      if (confirm("Are you sure?")) {
        $(this).closest("li").remove();
      }
    });
  }

  /**
   *This is the entry point for our program
   *
   */
  function Start() {
    console.log("App Started...");

    loadHeader(router.ActiveLink);

    loadContent(router.ActiveLink, ActiveLinkCallBack(router.ActiveLink));

    loadFooter();
  }

  window.addEventListener("load", Start);

  core.Start = Start;
})(core || (core = {}));
