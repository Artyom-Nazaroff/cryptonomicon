const API_KEY =
	'c2d9011a84d5cac502448c0c25146cd91ed482b7005e082ddb2c482dd6208726'

const tickersHandlers = new Map()

const socket = new WebSocket(
	`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
)

const AGGREGATE_INDEX = '5'

socket.addEventListener('message', (e) => {
	const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data)

	if (type !== AGGREGATE_INDEX || newPrice === undefined) return

	const handlers = tickersHandlers.get(currency) ?? [];
	handlers.forEach((fn) => fn(newPrice));
})

const sendToWebSocket = (message) => {
	const stringifiedMessage = JSON.stringify(message)

	if (socket.readyState === WebSocket.OPEN) {
		socket.send(stringifiedMessage)
		return
	}

	socket.addEventListener('open', () => {
		socket.send(stringifiedMessage);
	}, { once: true })
}

const subscribeToTickerOnWs = (ticker) => {
	sendToWebSocket({
		action: 'SubAdd',
		subs: [`5~CCCAGG~${ticker}~USD`],
	})
}

const unsubscribeFromTickerOnWs = (ticker) => {
	sendToWebSocket({
		action: 'SubAdd',
		subs: [`5~CCCAGG~${ticker}~USD`],
	})
}

export const subscribeToTicker = (ticker, cb) => {
	const subscribers = tickersHandlers.get(ticker) || []
	tickersHandlers.set(ticker, [...subscribers, cb])
	subscribeToTickerOnWs(ticker)
}

export const unsubscribeFromTicker = (ticker) => {
	tickersHandlers.delete(ticker)
	unsubscribeFromTickerOnWs(ticker)
}
