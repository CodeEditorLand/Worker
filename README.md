<table>
<tr>
<td align="left" valign="middle">
<h3 align="left"> Worker</h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
🍩
</h3>
</td>
<td align="left" valign="middle">
<h3 align="left"> + </h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
<a href="https://Editor.Land" target="_blank">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://PlayForm.Cloud/Dark/Image/GitHub/Land.svg">
<source media="(prefers-color-scheme: light)" srcset="https://PlayForm.Cloud/Image/GitHub/Land.svg">
<img width="28" alt="Land Logo" src="https://PlayForm.Cloud/Image/GitHub/Land.svg">
</picture>
</a>
</h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
<a href="https://Editor.Land" target="_blank">
Land
</a>
</h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
🏞️
</h3>
</td>
</tr>
</table>


---

# **Worker**&#x2001;🍩

> **Web applications that lose authentication state on network drops force users to re-authenticate. Tokens stored in plaintext are accessible to any script running on the page.**

_"Offline-capable. Auth tokens encrypted. Auto-refreshed."_

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://github.com/CodeEditorLand/Worker/tree/Current/LICENSE)
[<img src="https://editor.land/Image/TypeScript.svg" width="14" alt="TypeScript" />](https://www.typescriptlang.org/)&#x2001;[![NPM Version](https://img.shields.io/npm/v/@codeeditorland/worker.svg)](https://www.npmjs.com/package/@codeeditorland/worker)

The editor shell stays functional and authenticated even when the network drops. Auth tokens are AES-GCM encrypted, requests are HMAC-signed, and tokens refresh automatically without user action. Caching, offline support, and dynamic CSS imports all managed through the Service Worker layer.

---

## What It Does&#x2001;🔐

- **AES-GCM encrypted auth.** Tokens stored with hardware-backed encryption, not plaintext.
- **HMAC-signed requests.** Every request to backend Workers is cryptographically signed.
- **Auto token refresh.** Tokens refresh automatically without user interaction.
- **Offline support.** The editor shell works without a network connection.

---

## In the Ecosystem&#x2001;🍩 + 🏞️

```mermaid
graph LR
classDef worker fill:#f9f,stroke:#333,stroke-width:2px;
classDef client fill:#9cf,stroke:#333,stroke-width:2px;
classDef cache fill:#cfc,stroke:#333,stroke-width:1px;

subgraph "Client (Browser)"
Client["Client Application"]:::client
end

subgraph "Service Worker"
SW["Service Worker"]:::worker
CoreCache["CACHE_CORE"]:::cache
AssetCache["CACHE_ASSET"]:::cache
end

Client -- Fetch /Application/ --> SW
SW -- Network-first --> CoreCache
CoreCache -- Return cached or network --> SW

Client -- Import *.css --> SW
SW -- JS module response --> Client
Client -- Create <link> --> Client
Client -- Fetch CSS --> SW
SW -- Cache-first --> AssetCache
AssetCache -- Return CSS --> SW
SW -- CSS applied --> Client
```

---

## Development&#x2001;🛠️

Worker is a component of the Land workspace. Follow the
[Land Repository](https://github.com/CodeEditorLand/Land) instructions to
build and run.

---

## License&#x2001;⚖️

CC0 1.0 Universal. Public domain. No restrictions.
[LICENSE](https://github.com/CodeEditorLand/Worker/tree/Current/LICENSE)

---

## See Also

- [Worker Documentation](https://editor.land/Doc/worker)
- [Architecture Overview](https://editor.land/Doc/architecture)
- [Mountain](https://github.com/CodeEditorLand/Mountain)


## Funding & Acknowledgements 🙏🏻

Code Editor Land is funded through the NGI0 Commons Fund, established by NLnet
with financial support from the European Commission's Next Generation Internet
programme, under grant agreement No. 101135429.

The project is operated by PlayForm, based in Sofia, Bulgaria.

PlayForm acts as the open-source steward for Code Editor Land under the NGI0
Commons Fund grant.

<table>
	<thead>
		<tr>
			<th align="left"><strong>Land</strong></th>
			<th align="left"><strong>PlayForm</strong></th>
			<th align="left"><strong>NLnet</strong></th>
			<th align="left"><strong>NGI0 Commons Fund</strong></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td align="left" valign="middle">
				<a href="https://Editor.Land">
					<img width="60" src="https://raw.githubusercontent.com/CodeEditorLand/Asset/refs/heads/Current/Logo/Land.svg" alt="Land">
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://PlayForm.Cloud">
					<img width="76" src="https://raw.githubusercontent.com/PlayForm/Asset/refs/heads/Current/Logo/PlayForm.svg" alt="PlayForm">
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL">
					<img width="240" src="https://NLnet.NL/logo/banner.svg" alt="NLnet">
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL/commonsfund">
					<img width="240" src="https://NLnet.NL/image/logos/NGI0CommonsFund_tag_black_mono.svg" alt="NGI0 Commons Fund">
				</a>
			</td>
		</tr>
	</tbody>
</table>

---

**Project Maintainers**: Source Open
([Source/Open@Editor.Land](mailto:Source/Open@Editor.Land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Worker) |
[Report an Issue](https://github.com/CodeEditorLand/Worker/issues) |
[Security Policy](https://github.com/CodeEditorLand/Worker/security/policy)
