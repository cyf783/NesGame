class Cheat {

    static reg = /([\da-fA-F]{4})-([0-3])(\d)-([\da-fA-F]{2,})/

    constructor() {
        this.enable = false
        this.fixed = {}
        this.greater = {}
        this.lesser = {}
    }

    valid(cheatCode) {
        return Cheat.reg.test(cheatCode)
    }

    cheatType(cheatCode) {
        const matchs = Cheat.reg.exec(cheatCode)
        if (!matchs) {
            return
        }
        return toHexNumber(matchs[2])
    }

    parse(cheatCode) {
        const matchs = Cheat.reg.exec(cheatCode)

        if (!matchs) {
            emitError('无效的金手指。')
            return
        }

        const cheatAddress = toHexNumber(matchs[1])
        if (cheatAddress > 0xffff) {
            emitError('无效的金手指。')
            return
        }

        const cheatType = toHexNumber(matchs[2])
        const cheatValue = toHexNumber(matchs[4])

        this.on(cheatAddress, cheatType, cheatValue)
    }

    on(cheatAddress, cheatType, cheatValue) {
        this.enable || (this.enable = true)
        switch (cheatType) {
            case 0:
                this.fixed[cheatAddress] = cheatValue
                break
            case 1:
                nes.cpu.mem[cheatAddress] = cheatValue
                break
            case 2:
                this.lesser[cheatAddress] = cheatValue
                break
            case 3:
                this.greater[cheatAddress] = cheatValue
                break
        }
    }

    remove(cheatAddress) {
        delete this.fixed[cheatAddress]
        delete this.greater[cheatAddress]
        delete this.lesser[cheatAddress]
    }

    disable(cheatCode) {
        const matchs = Cheat.reg.exec(cheatCode)
        if (!matchs) {
            return
        }
        const cheatAddress = toHexNumber(matchs[1])
        this.remove(cheatAddress)
    }

    init() {
        this.enable = false
        this.fixed = {}
        this.greater = {}
        this.lesser = {}
    }

    onFrame() {
        if (this.enable) {
            Object.entries(this.fixed).forEach(([address, value]) => {
                nes.cpu.mem[address] = value
            })
            Object.entries(this.greater).forEach(([address, value]) => {
                if (nes.cpu.mem[address] < value) {
                    nes.cpu.mem[address] = value
                }
            })
            Object.entries(this.lesser).forEach(([address, value]) => {
                if (nes.cpu.mem[address] > value) {
                    nes.cpu.mem[address] = value
                }
            })
        }
    }
}

const cheat = new Cheat()

window.JSNES.cheat = cheat;