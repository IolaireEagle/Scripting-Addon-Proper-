import { Container, Player, world, MinecraftEffectTypes } from "@minecraft/server";

const validEnchants = ["explode"];

world.events.entityDie.subscribe((event) => {
    const player = event.damageSource.damagingEntity;
    const deadMob = event.deadEntity
    if (!(player instanceof Player)) return;
    /** @type {Container} */
    const container = player.getComponent("inventory").container;
    const heldItem = container.getItem(player.selectedSlot);
    const lore = heldItem.getLore();
    for (const enchant of lore) {
        if (enchant.includes("Explode")) {
            var lvlArr = enchant.match(/\d+/g);
            if (lvlArr != null) {
                var lvl = parseInt(lvlArr.join(""))
                player.dimension.createExplosion(deadMob.getHeadLocation(), (lvl * 2))
            } else {
                player.dimension.createExplosion(deadMob.getHeadLocation(), 2)
            }
        }
    }
})

function customEnchantCommand(sender, args) {
    try {
        /** @type {Container} */
        var container = sender.getComponent("inventory").container;
        var heldItem = container.getItem(sender.selectedSlot);
        var enchant = args.replace(/[^a-z]/gi, '')
        enchant = enchant.replace("enchant", "")
        var lvlArr = args.match(/\d+/g);
        var enchantAndLvl = enchant + " 1"
        if (lvlArr != null) {
            var lvl = String(lvlArr.join(""))
            var enchantAndLvl = enchant.concat(" ", lvl)
        }
        heldItem.setLore([enchantAndLvl.charAt(0).toUpperCase() + enchantAndLvl.slice(1)]);
        container.setItem(sender.selectedSlot, heldItem)
        sender.sendMessage("Enchanting successful!")
        sender.playSound("random.levelup")
    }
    catch (e) {
        sender.sendMessage("§cFailed to enchant! Reason: " + String(e))
    }

}

function breakCommand(sender) {
    try {
        const block = sender.getBlockFromViewDirection()
        let result = String(block.x).concat(" ", String(block.y), " ", String(block.z))
        result = "setblock " + result + " air [] destroy"
        sender.runCommandAsync(result)
    }
    catch (e) {
        sender.sendMessage("§cFailed to break block! Block is out of range")
    }
}

function explodeCommand(sender, args) {
    const block = sender.getBlockFromViewDirection()
    if (args == "") {
        args = "4"
    }
    block.dimension.createExplosion(block.location, parseInt(args))
}

function feedCommand(sender) {
    sender.addEffect(MinecraftEffectTypes.saturation, 2, 255, false)
    sender.playSound("random.burp")
}

world.events.beforeChat.subscribe((event) => {
    const player = event.sender
    if (!(player instanceof Player)) return;
    if (event.message.includes("!")) {
        if (player.isOp) {
            let noExclamName = event.message.replace(/[^a-z]/gi, '')
            if (event.message.includes("enchant")) {
                noExclamName = noExclamName.replace("enchant", "")
                if (validEnchants.includes(noExclamName)) {
                    customEnchantCommand(player, event.message)
                } else {
                    player.sendMessage("§cCould not find that enchantment!")
                }
            } else if (event.message.includes("break")) {
                breakCommand(player)
            } else if (event.message.includes("day")) {
                player.runCommandAsync("time set day")
                player.sendMessage("Set the time to day!")
            } else if (event.message.includes("easy")) {
                player.runCommandAsync("difficulty e")
                player.sendMessage("Set the difficulty to Easy!")
            } else if (event.message.includes("explode")) {
                let lvl = event.message.replace(/[a-z, !]/gi, '')
                noExclamName = noExclamName.replace("explode", "")
                explodeCommand(player, lvl)
            } else if (event.message.includes("feed")) {
                feedCommand(player)
            }
            else {
                player.sendMessage("§eUnknown command!")
            }
            event.cancel = true
        } else {
            player.sendMessage("§eYou must be an operator to run this command!")
        }
    }
})