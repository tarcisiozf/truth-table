class Main {
	constructor() {
		this.solveExp = this.solveExp.bind(this)
		this.printSymbol = this.printSymbol.bind(this)
		this.clear = this.clear.bind(this)

		this.true = 'T'
		this.false = 'F'
		this.order = true

		this.message = document.getElementById('message')
		this.result = document.getElementById('result')
		this.input = document.getElementById('in_exp')

		this.input.addEventListener('keyup', this.solveExp)

		document
			.getElementById('clear')
			.addEventListener('click', this.clear)

		this.input.focus()
		this.renderButtons()
	}

	solveExp() {
		const exp_str = this.input.value.trim()

		if ( exp_str.length === 0 ) {
			this.clearMessage()
			return
		}

		this.loadOptions()

		try {
			checkMatchingParentheses(exp_str)

			const [exp, vars] = parse(exp_str)
			const table = createTable(vars.length, this.order)

			const results = table.map(values =>
				solve(exp, bindValues(vars, values)))

			this.clearMessage()
			this.renderResult(table, vars, results)
		} catch (e) {
			this.setErrorMessage(e)
		}
	}

	setMessage(msg, color) {
		this.message.textContent = msg
		this.message.style.color = color
	}

	clearMessage() {
		this.setMessage('Type your expression', '#066b9e')
	}

	setErrorMessage(msg) {
		this.setMessage(msg, '#9e0606')
		this.clearResults()
	}

	renderButtons() {
		const wrapper = document.getElementById('symbols')

		for(const symbol of Object.keys(symbols)) {

			const name = symbols[symbol].name.toUpperCase()

			const button = document.createElement('button')
			button.textContent = symbol
			button.alt = name
			button.title = name
			button.addEventListener('click', this.printSymbol)

			wrapper.appendChild(button)
		}
	}

	printSymbol(event) {
		const start = this.input.selectionStart
		const end = this.input.selectionEnd
		const value = this.input.value
		const symbol = event.target.textContent

		this.input.value =
			value.substr(0, start)
			+ symbol
			+ value.substr(end)

		this.input.focus()
		this.input.setSelectionRange(end + 1, end + 1)
		this.solveExp()
	}

	renderResult(bool_table, vars, results) {
		const table = document.createElement('table')

		table.appendChild(this.renderRow(vars, '\tResult\t'))

		for(let i = 0; i < bool_table.length; i++) {
			table.appendChild(this.renderRow(bool_table[i], results[i]))
		}

		this.clearResults()
		this.result.appendChild(table)
	}

	renderRow(vars, result) {
		const row = vars.slice(0)
		row.push(result)

		const tr = document.createElement('tr')

		for(let value of row) {
			const td = document.createElement('td')

			if (typeof value === 'boolean') {
				value = value
					? this.true
					: this.false
			} else {
				value = '<b>' + value.toUpperCase() + '</b>'
			}

			td.innerHTML = value

			tr.appendChild(td)
		}

		return tr
	}

	clearResults() {
		while(this.result.firstChild) {
			this.result.removeChild(this.result.firstChild)
		}
	}

	loadOptions() {
		const constants = document.querySelector('input[name=constants]:checked').value
		const order = document.querySelector('input[name=order]:checked').value

		this.order = order === 'T -> F'

		if ( constants === 'T/F' ) {
			this.true = 'T'
			this.false = 'F'
		} else {
			this.true = '1'
			this.false = '0'
		}
	}

	clear() {
		this.input.value = ''
		this.input.focus()
		this.clearMessage()
	}
}

window.onload = () => new Main()
