// Coordinates the interaction of elements on the page
(function() {

    var DOM = {};
    DOM.required = $("#required-parts");
    DOM.total = $("#total-parts");
    DOM.secret = $("#secret");
    DOM.distributesize = $("#distributesize");
    DOM.recreatesize = $("#recreatesize");
    DOM.error = $("#error-message");
    DOM.generated = $("#generated");
    DOM.parts = $("#parts");
    DOM.combined = $("#combined");
    DOM.splitSecret = $("#split-secret")
    DOM.splitSecretTab = $("#split-secret-tab")
    DOM.combineSecret = $("#combine-secret")
    DOM.combineSecretTab = $("#combine-secret-tab")

    function init() {
        // Events
        DOM.required.addEventListener("input", generateParts);
        DOM.total.addEventListener("input", generateParts);
        DOM.secret.addEventListener("input", generateParts);
        DOM.parts.addEventListener("input", combineParts);

        DOM.splitSecretTab.addEventListener("click", () => {
            clearError()
            switchTab(true)
        })
        DOM.combineSecretTab.addEventListener("click", () => {
            clearError()
            switchTab(false)
        })
    }

    function switchTab(split) {
        DOM.splitSecretTab.classList.toggle("font-semibold", split)
        DOM.splitSecretTab.classList.toggle("active-tab", split)
        DOM.combineSecretTab.classList.toggle("font-semibold", !split)
        DOM.combineSecretTab.classList.toggle("active-tab", !split)

        DOM.splitSecret.classList.toggle("hidden", !split)
        DOM.combineSecret.classList.toggle("hidden", split)
    }

    function setError(message) {
        DOM.error.textContent = "Error: " + message;
        DOM.error.classList.toggle("hidden", false)
    }

    function clearError() {
        DOM.error.textContent = "";
        DOM.error.classList.toggle("hidden", true)
    }

    function generateParts() {
        // Clear old generated
        DOM.generated.innerHTML = "";
        // Get the input values
        var secret = DOM.secret.value;
        var secretHex = secrets.str2hex(secret);
        var total = parseFloat(DOM.total.value);
        var required = parseFloat(DOM.required.value);
        // validate the input
        if (total < 2) {
            setError("Total must be at least 2")
            return;
        }
        else if (total > 255) {
            setError("Total must be at most 255")
            return;
        }
        else if (required < 2) {
            setError("Required must be at least 2")
            return;
        }
        else if (required > 255) {
            setError("Required must be at most 255")
            return;
        }
        else if (isNaN(total)) {
            setError("Invalid value for total")
            return;
        }
        else if (isNaN(required)) {
            setError("Invalid value for required")
            return;
        }
        else if (required > total) {
            setError("Required must be less than total")
            return;
        }
        else if (secret.length == 0) {
            setError("Secret is blank")
            return;
        }
        else {
            clearError()
        }
        // Generate the parts to share
        var minPad = 1024; // see https://github.com/amper5and/secrets.js#note-on-security
        var shares = secrets.share(secretHex, total, required, minPad);
        // Display the parts
        for (var i=0; i<shares.length; i++) {
            var share = shares[i];
            var li = document.createElement("li");
            li.classList.add("px-2", "py-2.5", "odd:bg-[#f4f4f3]", "even:bg-[#e9e8e6]");
            li.textContent = share;
            DOM.generated.appendChild(li);
        }
        // Update the plain-language info
        DOM.distributesize.textContent = total;
        DOM.recreatesize.textContent = required;
    }

    function combineParts() {
        // Clear old text
        DOM.combined.textContent = "";
        // Get the parts entered by the user
        var partsStr = DOM.parts.value;
        // Validate and sanitize the input
        var parts = partsStr.trim().split(/\s+/);
        // Combine the parts
        try {
            var combinedHex = secrets.combine(parts);
            var combined = secrets.hex2str(combinedHex);
        }
        catch (e) {
            DOM.combined.textContent = e.message;
        }
        // Display the combined parts
        DOM.combined.textContent = combined;
    }

    init();

})();
