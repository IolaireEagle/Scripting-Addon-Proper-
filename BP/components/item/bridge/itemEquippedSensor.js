export default function defineComponent({ name, template, schema }) {
	// TODO: Apply some sort of versioning to is_(un)equipped component schema reference
	name('bridge:item_equipped_sensor')
	schema({
		description: 'Allows you to run commands, player events and apply components to the player when the item is equipped/unequipped in specified slots.',
		additonalProperties: false,
		properties: {
			sensors: {
				type: 'array',
				description: 'List of sensors to detect this item.',
				items: {
					properties: {
						on_equip: {
							description:
								'List events and commands to be run on the player when the item is equipped.',
							type: 'array',
							items: {
								$ref:
									'/data/packages/minecraftBedrock/schema/general/reference/animationEvent.json',
							},
						},
						on_unequip: {
							description:
								'List events and commands to be run on the player when the item is unequipped.',
							type: 'array',
							items: {
								$ref:
									'/data/packages/minecraftBedrock/schema/general/reference/animationEvent.json',
							},
						},
						is_equipped: {
							description:
								'Components to be applied to the player while the item is equipped.',
							$ref:
								'/data/packages/minecraftBedrock/schema/entity/v1.17.20/components/_main.json',
						},
						is_unequipped: {
							description:
								'Components to be applied to the player while the item is unequipped.',
							$ref:
								'/data/packages/minecraftBedrock/schema/entity/v1.17.20/components/_main.json',
						},
						slot: {
							description: 'Set the slot to check for this item.',
							$ref:
								'/data/packages/minecraftBedrock/schema/general/slotType.json',
						},
					},
				},
			},
		},
	})

	template(({ sensors }, { create, player, identifier }) => {
		if (sensors && Array.isArray(sensors)) {
			sensors.forEach((sensor, i) => {
				const tag = `bridge:${identifier.split(':').pop()}_sensor_${i}`
				const query = `query.equipped_item_any_tag('${
					sensor.slot ?? 'slot.weapon.mainhand'
				}', '${tag}')`
				const equipEvent = `${tag}_on_equip`
				const unequipEvent = `${tag}_on_unequip`
	
				const entry = sensor.on_equip
					? [`@s ${equipEvent}`, ...sensor.on_equip]
					: [`@s ${equipEvent}`]
				const exit = sensor.on_unequip
					? [`@s ${unequipEvent}`, ...sensor.on_unequip]
					: [`@s ${unequipEvent}`]
	
				create(
					{
						[`tag:${tag}`]: {},
					},
					'minecraft:item/components'
				)
	
				player.animationController({
					initial_state: 'not_equipped',
					states: {
						not_equipped: {
							transitions: [
								{
									is_equipped: query,
								},
							],
						},
						is_equipped: {
							transitions: [
								{
									not_equipped: `!${query}`,
								},
							],
							on_entry: entry,
							on_exit: exit,
						},
					},
				})
	
				player.create(
					{
						[`${tag}_equipped`]: { ...sensor.is_equipped },
						[`${tag}_unequipped`]: { ...sensor.is_unequipped },
					},
					'minecraft:entity/component_groups'
				)
				player.create(
					{
						[equipEvent]: {
							add: {
								component_groups: [`${tag}_equipped`],
							},
							remove: {
								component_groups: [`${tag}_unequipped`],
							},
						},
						[unequipEvent]: {
							add: {
								component_groups: [`${tag}_unequipped`],
							},
							remove: {
								component_groups: [`${tag}_equipped`],
							},
						},
					},
					'minecraft:entity/events'
				)
			})
		}
	})
}
