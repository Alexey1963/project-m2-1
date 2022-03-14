const currencyStr = `EUR,CHF,NOK,CAD,RUB,GBP,MXN,CNY,ISK,KRW,HKD,CZK,BGN,BRL,USD,IDR,SGD,PHP,RON,HUF,ILS,THB,SEK,NZD,AUD,DKK,HRK,PLN,TRY,INR,MYR,ZAR,JPY`;

window.addEventListener('load', () => init());

function init() {
    const currencyArr = currencyStr.split(',');
    const changeBtn = document.querySelector('#btn-change')
    const shadow = document.querySelector('.shadow')
    let timeout;

    const blocks = [];

    function inProgress() {
        shadow.classList.add('on');
        changeBtn.classList.remove('on');
    }

    function inquire(inputId) {
        console.log(blocks[inputId - 1].value, blocks[inputId % 2].value, inputId);

        if (blocks[0].value !== blocks[1].value) {
            timeout = setTimeout(() => {
                inProgress();
            }, 500);
            console.log(timeout);
            API.request(blocks[0].value, blocks[1].value, inputId, answer);
        }
    };

    function round(x) {
        return Math.round(x * 10000) / 10000;
    }

    function answer(rates, id) {

        clearTimeout(timeout);
        shadow.classList.remove('on')
        changeBtn.classList.add('on')
        // console.log(id)

        let factor = 0;
        for (factor of Object.values(rates)) {

            console.log(factor, blocks[id - 1].inputField.value, blocks[id % 2].inputField.value);
            blocks[0].rateField.innerText = `1 ${blocks[0].value} = ${round(factor) + ' ' + blocks[1].value}`

            if (id === 2) {
                factor = 1 / factor;
            }
            blocks[1].rateField.innerText = `1 ${blocks[1].value} = ${round(factor) + ' ' + blocks[0].value}`
            blocks[id % 2].inputField.value = round(blocks[id - 1].inputField.value * factor);
        }
    }

    ["RUB", "USD"].forEach((currency, index) => {
        const currencyInput = new CurrencyInput(index + 1, currencyArr, currency, inquire);
        blocks.push(currencyInput);
    });
    inquire(1);

    changeBtn.addEventListener('click', (e) => {
        console.log(e.currentTarget);
        // blocks.reverse();
        // blocks[0].inputField.value = blocks[1].inputField.value
        // changeBtn.parentElement.insertBefore(blocks[0].container, changeBtn);
        // let title = blocks[0].container.querySelector('.title');
        // title.innerText = 'У меня есть';
        // changeBtn.parentElement.append(blocks[1].container);
        // title = blocks[1].container.querySelector('.title');
        // title.innerText = 'Хочу приобрести';
        let value1 = blocks[0].value;
        let value2 = blocks[1].value;
        blocks[0].setValue(value2);
        blocks[1].setValue(value1);
        console.log(blocks[0].value, blocks[1].value)
        inquire(1);
    })

}

class CurrencyInput {
    constructor(inputId, currencyList, defaultValue, callback) {
        this.value = defaultValue;
        const block = document.querySelector(`#block-${inputId}`);
        this.inputField = block.querySelector(`#input-${inputId}`);
        this.inputField.value = 1;
        this.rateField = block.querySelector('.rate');
        const select = block.querySelector('select');
        const btns = block.querySelectorAll('.btn:not(select)');
        this.menu = block.querySelector('.menu');
        this.container = block;
        this.select = select;
        this.btns = btns;

        select.addEventListener('change', () => {
            block.querySelector('.selected').classList.remove('selected');
            select.classList.add('selected');
            this.value = select.value;
            callback(inputId);
        })

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                block.querySelector('.selected').classList.remove('selected');
                btn.classList.add('selected');
                this.value = btn.innerText;
                callback(inputId);
            })
        })

        currencyList.forEach((currencyText) => {
            const option = document.createElement('option');
            option.innerText = currencyText;
            select.append(option);
        });

        const input = block.querySelector('input')
        input.addEventListener('change', (e) => {
            console.log(e.target.value)
            this.inputField.value = e.target.value.replace(/,/, '.');
            console.log(this.inputField.value, inputId)
            callback(inputId);
        })

    }

    setValue(value) {
        const btn = [...this.btns].find(btn => btn.innerText === value);
        this.container.querySelector('.selected').classList.remove('selected');
        if (btn) {
            btn.classList.add('selected');
        } else {
            const options = this.select.querySelectorAll('option');
            const option = [...options].find(option => option.value === value);
            option.selected = true;
            this.select.classList.add('selected');
        }
        this.value = value;
    }
}

const API = {
    async request(base, symbols, inputId, callback) {
        try {
            res = await fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${symbols}`)
            data = await res.json();
            // console.log(data.rates)
            callback(data.rates, inputId);
        } catch (e) {
            // console.log(e.message)
            err = document.querySelector('.error')
            err.classList.add('on');
            err.firstElementChild.innerText = `${e.message}`
            close = err.querySelector('.button');
            // console.log(close)
            close.addEventListener('click', () => {
                err.classList.toggle('on');
                const shadow = document.querySelector('.shadow')
                const changeBtn = document.querySelector('#btn-change')
                changeBtn.classList.add('on');
                shadow.classList.remove('on');
            })

        }
    }
}

