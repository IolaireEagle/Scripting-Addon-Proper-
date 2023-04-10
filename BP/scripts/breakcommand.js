import { Player, world } from "@minecraft/server";

world.events.beforeChat.subscribe((event) => {
    const sender = event.sender
    if (!(sender instanceof Player)) return;
    try {
        if (event.message == "!break") {
            const targetedBlock = sender.getBlockFromViewDirection()
            let command = "setblock"
            let setBlockT = "air"
            let targetBlockX = String(targetedBlock.x)
            let targetBlockY = String(targetedBlock.y)
            let targetBlockZ = String(targetedBlock.z)
            let result = command.concat(targetBlockX, " ", targetBlockY, " ", targetBlockZ, " ", setBlockT)

            sender.dimension.runCommandAsync(result)
        } else {
            return
        }
    }
    catch (e) {
        sender.sendMessage("§cFailed to execute custom command! Reason: " + String(e))
        event.cancel = true
    }
})