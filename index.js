let {send} = require("micro")
let execa = require("execa")
let net = require("net")
let fs = require("fs").promises
let crypto = require("crypto")
let path = require("path")

async function getSnoot(name) {
	let {stdout: snootid} = await execa("id", ["-u", name]).catch(() => ({}))
	return snootid
}

async function own(name, scope) {
	return execa(path.join(__dirname, "bin", "own"), [name, scope])
}

async function authenticate(request, response, name, scope) {
	let snootid = await getSnoot(name)

	if (!snootid) {
		return send(response, 401, `${name} is NOT a snoot`)
	}

	return `<!doctype html>
<meta charset="utf-8">
<title>authenticate ${name}</title>
<h1>authenticate yourself</h1>

<p>hello, ${name}</p>

<p>click this:</p>

<p><a href="/auth/listen/${name}">listen</a></p>

<p>then run this in your terminal!</p>

<pre><code>
ssh ${name}@${scope}.snoot.club -p 2424
</code></pre>
`
}

async function listen(request, response, name, scope) {
	let snootid = await getSnoot(name)

	if (!snootid) {
		return send(response, 401, `${name} is NOT a snoot`)
	}

	let sockPath = `/snoots/auth/socks/${snootid}.sock`

	fs.unlink(sockPath).catch(() => ({}))
	let timeout
	let server = net.createServer(function (client) {
		let data = ""
		client.on("data", d => {
			data += d.toString()
		})
		client.on("end", async _ => {
			if (data == "success") {
				clearTimeout(timeout)
				let token = `${name}.${crypto.randomBytes(22).toString("base64")}`
				await fs.writeFile(`/snoots/auth/sessions/${name}.${scope}`, token)
				await own(name, scope)
				response.setHeader(
					"Set-Cookie",
					`session=${token}; Domain=${scope}.snoot.club; Secure; Path=/`
				)
				send(response, 200, "Thanks ! Enjoy your cookie")
			} else {
				clearTimeout(timeout)
				return send(response, 401, "Something naughty happened.")
			}
		})
		client.on("error", () => {
			clearTimeout(timeout)
			return send(response, 400, "The ssh client errored out :(")
		})
	})
	timeout = setTimeout(() => {
		server.close(function () {
			send(response, 408, "That took too long! please try again")
		})
	}, 60000)
	try {
		server.listen(sockPath)
	} catch (error) {
		send(
			response,
			500,
			"something went wrong trying to listen ,perhaps you are listening on another tab or are the victim of a DoS attack?"
		)
	}
}

async function notfound(request, response) {
	return send(response, 404, "sorry")
}

module.exports = (request, response) => {
	let parts = request.url.split("/").filter(Boolean)
	let [, scope] = request.headers.host.match(/^(.+)\.snoot\.club$/)

	if (parts.length == 1) {
		let [name] = parts
		return authenticate(request, response, name, scope)
	}

	if (parts.length == 2 && parts[0] == "listen") {
		let [, name] = parts
		return listen(request, response, name, scope)
	}

	return notfound(request, response)
}
