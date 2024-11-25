document.addEventListener("DOMContentLoaded", () => {
    const fromButtons = document.querySelectorAll(".input-section .currency-btn");
    const toButtons = document.querySelectorAll(".output-section .currency-btn");

    let fromCurrency = "RUB";
    let toCurrency = "USD";

    const fromAmountInput = document.getElementById("fromAmount");
    const toAmountInput = document.getElementById("toAmount");
    const fromRateDisplay = document.getElementById("fromRate");
    const toRateDisplay = document.getElementById("toRate");

    const apiKey = "ba536e9b9aba5317f40b4a00c0643541";
    const apiBase = "http://api.currencylayer.com/live";

    const activateButton = (buttons, selectedCurrency) => {
        buttons.forEach((button) => {
            if (button.textContent === selectedCurrency) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });
    };

    const fetchExchangeRate = async (fromCurrency, toCurrency) => {
        try {
            const currencies = `${fromCurrency},${toCurrency}`;
            const response = await fetch(`${apiBase}?access_key=${apiKey}&currencies=${currencies}`);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();

            if (data && data.success && data.quotes) {
                const quotes = data.quotes;

                const usdToFrom = fromCurrency === 'USD' ? 1 : quotes[`USD${fromCurrency}`];
                const usdToTo = toCurrency === 'USD' ? 1 : quotes[`USD${toCurrency}`];

                if (usdToFrom && usdToTo) {
                    const rate = usdToTo / usdToFrom;
                    return rate;
                } else {
                    throw new Error("Currency not found in response");
                }
            } else {
                throw new Error("Invalid API response");
            }
        } catch (error) {
            showNoInternetPopup();
            console.error(error);
            return null;
        }
    };

    const updateConversion = async () => {
        if (fromCurrency === toCurrency) {
            toAmountInput.value = fromAmountInput.value;
            fromRateDisplay.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
            toRateDisplay.textContent = `1 ${toCurrency} = 1 ${fromCurrency}`;
            return;
        }

        const rate = await fetchExchangeRate(fromCurrency, toCurrency);
        if (rate) {
            const amount = parseFloat(fromAmountInput.value) || 0;
            toAmountInput.value = (amount * rate).toFixed(4);
            fromRateDisplay.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
            const reverseRate = 1 / rate;
            toRateDisplay.textContent = `1 ${toCurrency} = ${reverseRate.toFixed(4)} ${fromCurrency}`;
        }
    };

    fromButtons.forEach((button) => {
        button.addEventListener("click", () => {
            fromCurrency = button.textContent;
            activateButton(fromButtons, fromCurrency);
            updateConversion();
        });
    });

    toButtons.forEach((button) => {
        button.addEventListener("click", () => {
            toCurrency = button.textContent;
            activateButton(toButtons, toCurrency);
            updateConversion();
        });
    });

    fromAmountInput.addEventListener("input", (event) => {
        const value = event.target.value.replace(/,/g, ".");
        event.target.value = value;
        updateConversion();
    });

    const showNoInternetPopup = () => {
        const popup = document.createElement("div");
        popup.className = "no-internet-popup";
        popup.innerHTML = `
            <img src="no-internet.jpg" alt="No Internet" />
            <p>Проблемы с подключением к интернету. Проверьте свое соединение.</p>
        `;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 5000);
    };

    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');

    hamburger.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });

    activateButton(fromButtons, fromCurrency);
    activateButton(toButtons, toCurrency);
    updateConversion();
});
