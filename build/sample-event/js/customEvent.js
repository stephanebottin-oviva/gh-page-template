define(["postmonger"], function (Postmonger) {
    "use strict";

    var connection = new Postmonger.Session();
    var payload = {};
    var steps = [
        // initialize to the same value as what's set in config.json for consistency
        { key: "selectTenant", label: "selectTenant" },
        { key: "enterTotalMealLog", label: "enterTotalMealLog" },
    ];
    var currentStep = steps[0].key;

    $(window).ready(onRender);

    connection.on("initEvent", initialize);
    connection.on("requestedTokens", onGetTokens);
    connection.on("requestedEndpoints", onGetEndpoints);

    connection.on("clickedNext", onClickedNext);
    connection.on("clickedBack", onClickedBack);
    connection.on("gotoStep", onGotoStep);

    function initialize(data) {
        var tenant;
        var totalMealLog;

        if (data) {
            payload = data;
        }

        if (payload["arguments"]) {
            tenant = payload["arguments"].tenant;
            totalMealLog = payload["arguments"].totalMealLog;
        }

        $("#select-tenant").val(tenant);
        $("#select-total-meal-log").val(totalMealLog);
    }

    function onGetTokens(tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
        // console.log(tokens);
    }

    function onGetEndpoints(endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        // console.log(endpoints);
    }

    function onClickedNext() {
        if (currentStep.key === "enterTotalMealLog") {
            save();
        } else {
            connection.trigger("nextStep");
        }
    }

    function onClickedBack() {
        connection.trigger("prevStep");
    }

    function onGotoStep(step) {
        showStep(step);
        connection.trigger("ready");
    }

    function onRender() {
        connection.trigger("ready"); // JB will respond the first time 'ready' is called with 'initEvent'

        connection.trigger("requestTokens");
        connection.trigger("requestEndpoints");
    }

    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex - 1];
        }

        currentStep = step;

        $(".step").hide();

        switch (currentStep.key) {
            case "selectTenant":
                $("#step1").show();
                break;
            case "enterTotalMealLog":
                $("#step2").show();
                $("#step2 input").focus();
                break;
        }
    }

    function save() {
        var tenant = $("#select-tenant")
            .find("option:selected")
            .attr("value");
        var totalMealLog = $("#select-total-meal-log").val();

        payload["arguments"] = payload["arguments"] || {};
        payload["arguments"].tenant = tenant;
        payload["arguments"].totalMealLog = totalMealLog;

        payload["metaData"] = payload["metaData"] || {};

        payload["configurationArguments"] = payload["configurationArguments"] || {};

        payload.dataExtensionId = "E195C311-BFBF-47AF-985E-3703ABB154FB";

        connection.trigger("updateEvent", payload);
    }
});
