# Frogcord

The only Discord client modification that you need.

## TODO

- [ ] Implement Frogcord's core

- [ ] Implement Frogcord's own plugin API

- [ ] Reimplement BetterDiscord, Replugged, and Vencord's plugin API

## Installation

This guide assumes you already have Git, Node.js, and pnpm installed, and running Windows (although support for more platforms are coming out soon, and feel free to open up a pull request adding support for more platforms).

1. Clone the repository

```
git clone https://github.com/frolleks/frogcord && cd frogcord
```

2. Inject to Discord client

```
pnpm run inject
```

It will tell you to choose which version of the client you want to inject. Simply type a number, and it'll inject it for you.

## License

```
The only Discord client modification you need.
Copyright (C) 2023 Frolleks

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
