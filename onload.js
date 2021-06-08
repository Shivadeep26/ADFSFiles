// Copyright (c) Microsoft Corporation.  All rights reserved.

// This file contains several workarounds on inconsistent browser behaviors that administrators may customize.
"use strict";

// iPhone email friendly keyboard does not include "\" key, use regular keyboard instead.
// Note change input type does not work on all versions of all browsers.
if (navigator.userAgent.match(/iPhone/i) != null) {
    var emails = document.querySelectorAll("input[type='email']");
    if (emails) {
        for (var i = 0; i < emails.length; i++) {
            emails[i].type = 'text';
        }
    }
}

// In the CSS file we set the ms-viewport to be consistent with the device dimensions, 
// which is necessary for correct functionality of immersive IE. 
// However, for Windows 8 phone we need to reset the ms-viewport's dimension to its original
// values (auto), otherwise the viewport dimensions will be wrong for Windows 8 phone.
// Windows 8 phone has agent string 'IEMobile 10.0'
if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
    var msViewportStyle = document.createElement("style");
    msViewportStyle.appendChild(
        document.createTextNode(
            "@-ms-viewport{width:auto!important}"
        )
    );
    msViewportStyle.appendChild(
        document.createTextNode(
            "@-ms-viewport{height:auto!important}"
        )
    );
    document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
}

// If the innerWidth is defined, use it as the viewport width.
if (window.innerWidth && window.outerWidth && window.innerWidth !== window.outerWidth) {
    var viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute('content', 'width=' + window.innerWidth + 'px; initial-scale=1.0; maximum-scale=1.0');
}

// Gets the current style of a specific property for a specific element.
function getStyle(element, styleProp) {
    var propStyle = null;

    if (element && element.currentStyle) {
        propStyle = element.currentStyle[styleProp];
    }
    else if (element && window.getComputedStyle) {
        propStyle = document.defaultView.getComputedStyle(element, null).getPropertyValue(styleProp);
    }

    return propStyle;
}

// The script below is used for downloading the illustration image 
// only when the branding is displaying. This script work together
// with the code in PageBase.cs that sets the html inline style
// containing the class 'illustrationClass' with the background image.
var computeLoadIllustration = function () {
    var branding = document.getElementById("branding");
    var brandingDisplay = getStyle(branding, "display");
    var brandingWrapperDisplay = getStyle(document.getElementById("brandingWrapper"), "display");

    if (brandingDisplay && brandingDisplay !== "none" &&
        brandingWrapperDisplay && brandingWrapperDisplay !== "none") {
        var newClass = "illustrationClass";

        if (branding.classList && branding.classList.add) {
            branding.classList.add(newClass);
        } else if (branding.className !== undefined) {
            branding.className += " " + newClass;
        }
        if (window.removeEventListener) {
            window.removeEventListener('load', computeLoadIllustration, false);
            window.removeEventListener('resize', computeLoadIllustration, false);
        }
        else if (window.detachEvent) {
            window.detachEvent('onload', computeLoadIllustration);
            window.detachEvent('onresize', computeLoadIllustration);
        }
    }
};

if (window.addEventListener) {
    window.addEventListener('resize', computeLoadIllustration, false);
    window.addEventListener('load', computeLoadIllustration, false);
}
else if (window.attachEvent) {
    window.attachEvent('onresize', computeLoadIllustration);
    window.attachEvent('onload', computeLoadIllustration);
}

/***** GPC CODES *****/

/* Configurables */

var DEFAULT_DOMAIN = '.';
var FORGOT_PASSWORD_URL = 'https://portaltest.clinicconnect.sg/gpweb/Account/ResetPassword';

/* Code overwritten for GPC here */

if (typeof LoginErrors != 'undefined') {
    LoginErrors = function () {
        this.userNameFormatError = 'Enter your username.';
        this.passwordEmpty = 'Enter your password.';
    };
}

if (typeof Login != 'undefined') {
    Login.submitLoginRequest = function () {
        var u = new InputUtil();
        var e = new LoginErrors();
        var userName = document.getElementById(Login.userNameInput);
        var password = document.getElementById(Login.passwordInput);

        if (!userName.value) {
            u.setError(userName, e.userNameFormatError);
            return false;
        }

        if (!password.value) {
            u.setError(password, e.passwordEmpty);
            return false;
        }

        document.forms['loginForm'].submit();

        return false;
    };
}

/* Code added for GPC here */

var userName;
var errorMsg;
var appTitle;

// main
var fullPage = document.getElementById('fullPage');
var userNameInput = document.getElementById('userNameInput');
var passwordInput = document.getElementById('passwordInput');
if (fullPage && userNameInput && passwordInput) {
    fullPage.style.display = 'none';
    var userNameInput = document.getElementById('userNameInput');
    if (userNameInput) {
        if (userNameInput.value.indexOf(DEFAULT_DOMAIN + '\\') >= 0) {
            userNameInput.value = userNameInput.value.replace(DEFAULT_DOMAIN + '\\', '');
        }
        userName = userNameInput.value;
    }
    var errorText = document.getElementById('errorText');
    if (errorText) {
        if (errorText.innerText.indexOf('Incorrect user ID or password') >= 0) {
            errorText.innerText = 'You may have entered an incorrect Username or Password.\nPlease note that the account will be locked after five (5) incorrect attempts.';
        }
        errorMsg = errorText.innerText;
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            fullPage.innerHTML = xhr.responseText;
            onLoadPartialHtml();
        }
    };
    xhr.open('GET', '/adfs/portal/css/partialHtml.css?t' + new Date().getTime());
    xhr.send(null);
}

// subs
function onLoadPartialHtml() {
    if (!isRunningOnGpc()) {
        var logo = document.getElementById('logo');
        if (logo) { 
            logo.src = logo.src.replace('/logo.png', '/logow.png');
                    logo.style.marginLeft = '-30px';
}
        var close = document.getElementById('close');
        if (close) {
            close.style.display = 'none';
        }
    }
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.action = '/adfs/ls/' + location.search;
    }
    fullPage.style.display = '';
    setUserName(userName);
    setErrorMsg(errorMsg);
    setAppTitle(appTitle);
}
function doReset() {
    setUserName('');
    var passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.value = '';
    }
    setErrorMsg('');
}
function doClose() {
    external.Exit();
}
function forgotPassword() {
    if (isRunningOnGpc()) {
        external.OpenInBrowser(FORGOT_PASSWORD_URL);
    }
    else {
        location.href = FORGOT_PASSWORD_URL;
    }
}
function isRunningOnGpc() {
    try {
        return external.IsRunningOnGpc();
    }
    catch (ex) {
        return false;
    }
}
function setUserName(name) {
    var userNameInput = document.getElementById('userNameInput');
    if (userNameInput && name != undefined) {
        userNameInput.value = name;
        userNameInput_Change();
        userNameInput.focus();
    }
}
function setErrorMsg(msg) {
    var errorText = document.getElementById('errorText');
    if (errorText && msg != undefined) {
        errorText.innerText = msg;
    }
}
function setAppTitle(title) {
    var header2 = document.getElementById('header2');
    if (header2 && title != undefined) {
        header2.innerText = title;
    }
    appTitle = title;
}
function userNameInput_Change() {
    var userNameInput = document.getElementById('userNameInput');
    var userNameInputHidden = document.getElementById('userNameInputHidden');
    var userName = userNameInput.value;
    try { userName = userName.trim(); } catch (ex) { }
    if (userName.indexOf('\\') == -1 && userName.indexOf('@') == -1) {
        userName = DEFAULT_DOMAIN + '\\' + userName;
    }
    userNameInputHidden.value = userName;
}

function disableAutoComplete() {
    document.getElementById("userNameInput").setAttribute("autocomplete", "off");
    document.getElementById("passwordInput").setAttribute("autocomplete", "off");
}

// fail-safe for logout
var url = location.href;
if (url.indexOf('wa=wsignout1.0') >= 0) {
    var match = /wreply=([^&$]+)/.exec(url);
    if (match != null) {
        url = decodeURIComponent(match[1]);
        url = url.toLowerCase();
        url = url.replace('http:', 'https:');
        url = url.replace(':80/', '/');
        location.href = url;
    }
}
