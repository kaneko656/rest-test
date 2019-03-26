const os = require('os')
const netInterface = os.networkInterfaces()
let localAddress = 'localhost'

for (const net in netInterface) {
	netInterface[net].forEach((n) => {
		if (n.family == 'IPv4' && n.address != '127.0.0.1' && localAddress == 'localhost') {
			localAddress = n.address
		}
	})
}

exports.toURL = (port = null) => {
	if(port) {
		return 'http://' + localAddress + ':' + port
	}
	return 'http://' + localAddress
}

exports.toHTTP = (port = null) => {
	if(port) {
		return 'http://' + localAddress + ':' + port
	}
	return 'http://' + localAddress
}

exports.toHTTPS = (port = null) => {
	if(port) {
		return 'https://' + localAddress + ':' + port
	}
	return 'https://' + localAddress
}
